import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CACHE_META_FILE = ".arch-insight-cache.json";
const CACHE_REGISTRY_FILE = "cache-manifest.json";

export async function downloadReleaseBundle({
  platform,
  releaseBaseUrl,
  tempDir,
  cacheDir
}) {
  const normalizedReleaseBaseUrl = ensureTrailingSlash(releaseBaseUrl);
  const manifestUrl = buildUrl(normalizedReleaseBaseUrl, "install-manifest.json");
  const manifest = JSON.parse(await readRemoteText(manifestUrl));
  const bundleRecord = manifest.bundles.find((bundle) => bundle.platform === platform);

  if (!bundleRecord) {
    throw new Error(`No release bundle declared for platform: ${platform}`);
  }

  const manifestVersion = String(manifest.version ?? "");
  const cacheKey = createCacheKey({
    releaseBaseUrl: normalizedReleaseBaseUrl,
    manifestVersion,
    platform
  });

  const defaultCacheRoot = path.resolve(
    cacheDir ?? path.join(os.homedir(), ".cache", "arch-insight", "releases")
  );
  const explicitRoot = tempDir ? path.resolve(tempDir) : "";
  const candidateRoots = dedupe([explicitRoot, defaultCacheRoot]);
  const expected = {
    platform,
    releaseBaseUrl: normalizedReleaseBaseUrl,
    manifestVersion,
    cacheKey,
    expectedFileCount: typeof bundleRecord.fileCount === "number" ? bundleRecord.fileCount : -1
  };

  const registryEntries = await readCacheRegistry(defaultCacheRoot);
  const trackedCandidates = registryEntries
    .filter((entry) => entry.cacheKey === cacheKey)
    .map((entry) => entry.bundlePlatformDir)
    .filter(Boolean);

  const pathCandidates = [];
  for (const root of candidateRoots) {
    pathCandidates.push(path.join(root, cacheKey, platform));
    pathCandidates.push(path.join(root, platform));
  }

  const allCandidates = dedupe([...trackedCandidates, ...pathCandidates]);
  for (const candidateDir of allCandidates) {
    const validation = await validateCandidate(candidateDir, expected, { requireMetadata: true });
    if (!validation.ok) {
      continue;
    }

    await writeCacheMetadata(candidateDir, {
      platform,
      releaseBaseUrl: normalizedReleaseBaseUrl,
      manifestVersion,
      cacheKey,
      bundleIndexSha256: validation.bundleIndexSha256
    });
    await upsertCacheRegistry(defaultCacheRoot, {
      cacheKey,
      platform,
      releaseBaseUrl: normalizedReleaseBaseUrl,
      manifestVersion,
      bundlePlatformDir: candidateDir
    });

    return {
      manifest,
      bundleDir: path.dirname(candidateDir),
      downloadedPlatformDir: candidateDir,
      releaseBaseUrl: normalizedReleaseBaseUrl,
      fromCache: true,
      cacheReason: `Reused local bundle (${candidateDir}) with matching release URL/version/platform and bundle-index.`
    };
  }

  const downloadRoot = explicitRoot || path.join(defaultCacheRoot, cacheKey);
  await fs.mkdir(downloadRoot, { recursive: true });

  const bundleUrl = buildUrl(normalizedReleaseBaseUrl, bundleRecord.bundleDir);
  const bundleDir = path.join(downloadRoot, platform);

  await fs.rm(bundleDir, { recursive: true, force: true });
  await copyRemoteDirectory(bundleUrl, bundleDir);

  const downloadedValidation = await validateCandidate(bundleDir, expected, { requireMetadata: false });
  if (!downloadedValidation.ok) {
    throw new Error(
      `Downloaded bundle validation failed for ${platform}: ${downloadedValidation.reason}`
    );
  }

  await writeCacheMetadata(bundleDir, {
    platform,
    releaseBaseUrl: normalizedReleaseBaseUrl,
    manifestVersion,
    cacheKey,
    bundleIndexSha256: downloadedValidation.bundleIndexSha256
  });
  await upsertCacheRegistry(defaultCacheRoot, {
    cacheKey,
    platform,
    releaseBaseUrl: normalizedReleaseBaseUrl,
    manifestVersion,
    bundlePlatformDir: bundleDir
  });

  return {
    manifest,
    bundleDir: downloadRoot,
    downloadedPlatformDir: bundleDir,
    releaseBaseUrl: normalizedReleaseBaseUrl,
    fromCache: false,
    cacheReason: `Downloaded bundle to ${bundleDir} and registered it for future reuse.`
  };
}

function createCacheKey({ releaseBaseUrl, manifestVersion, platform }) {
  return crypto
    .createHash("sha256")
    .update(`${releaseBaseUrl}|${manifestVersion}|${platform}`)
    .digest("hex")
    .slice(0, 16);
}

async function validateCandidate(candidateDir, expected, { requireMetadata }) {
  try {
    const stat = await fs.stat(candidateDir);
    if (!stat.isDirectory()) {
      return { ok: false, reason: "candidate is not a directory" };
    }

    const bundleIndexPath = path.join(candidateDir, "bundle-index.json");
    const bundleIndexText = await fs.readFile(bundleIndexPath, "utf8");
    const bundleIndexSha256 = hashString(bundleIndexText);
    const bundleIndex = JSON.parse(bundleIndexText);

    if (!Array.isArray(bundleIndex.files)) {
      return { ok: false, reason: "bundle-index has no files array" };
    }

    if (expected.expectedFileCount >= 0 && bundleIndex.files.length !== expected.expectedFileCount) {
      return {
        ok: false,
        reason: `bundle-index file count mismatch (${bundleIndex.files.length} !== ${expected.expectedFileCount})`
      };
    }

    const cacheMetaPath = path.join(candidateDir, CACHE_META_FILE);
    let meta = null;
    try {
      meta = JSON.parse(await fs.readFile(cacheMetaPath, "utf8"));
    } catch {
      meta = null;
    }

    if (requireMetadata && !meta) {
      return { ok: false, reason: "metadata missing" };
    }

    if (meta) {
      if (meta.platform !== expected.platform) {
        return { ok: false, reason: "metadata platform mismatch" };
      }
      if (ensureTrailingSlash(String(meta.releaseBaseUrl ?? "")) !== expected.releaseBaseUrl) {
        return { ok: false, reason: "metadata release URL mismatch" };
      }
      if (String(meta.manifestVersion ?? "") !== expected.manifestVersion) {
        return { ok: false, reason: "metadata manifest version mismatch" };
      }
      if (String(meta.cacheKey ?? "") !== expected.cacheKey) {
        return { ok: false, reason: "metadata cache key mismatch" };
      }
      if (meta.bundleIndexSha256 && meta.bundleIndexSha256 !== bundleIndexSha256) {
        return { ok: false, reason: "bundle-index hash mismatch" };
      }
    }

    return { ok: true, bundleIndexSha256 };
  } catch {
    return { ok: false, reason: "candidate check failed" };
  }
}

async function writeCacheMetadata(candidateDir, metadata) {
  const cacheMetaPath = path.join(candidateDir, CACHE_META_FILE);
  const payload = {
    ...metadata,
    updatedAt: new Date().toISOString()
  };
  await fs.writeFile(cacheMetaPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
}

async function readCacheRegistry(cacheRoot) {
  try {
    const content = await fs.readFile(path.join(cacheRoot, CACHE_REGISTRY_FILE), "utf8");
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.entries)) {
      return [];
    }
    return parsed.entries;
  } catch {
    return [];
  }
}

async function upsertCacheRegistry(cacheRoot, entry) {
  await fs.mkdir(cacheRoot, { recursive: true });
  const existing = await readCacheRegistry(cacheRoot);
  const normalizedDir = path.resolve(entry.bundlePlatformDir);
  const nextEntries = existing.filter((item) => {
    const sameKey = item.cacheKey === entry.cacheKey;
    const sameDir = path.resolve(String(item.bundlePlatformDir ?? "")) === normalizedDir;
    return !sameKey && !sameDir;
  });

  nextEntries.push({
    ...entry,
    bundlePlatformDir: normalizedDir,
    updatedAt: new Date().toISOString()
  });

  const payload = {
    version: 1,
    entries: nextEntries
  };
  await fs.writeFile(
    path.join(cacheRoot, CACHE_REGISTRY_FILE),
    JSON.stringify(payload, null, 2) + "\n",
    "utf8"
  );
}

function hashString(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildUrl(baseUrl, relativePath) {
  return new URL(relativePath.replace(/^\.\//, ""), ensureTrailingSlash(baseUrl)).toString();
}

function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

async function copyRemoteDirectory(sourceUrl, destinationDir) {
  if (sourceUrl.startsWith("file://")) {
    const sourceDir = fileURLToPath(sourceUrl);
    await fs.cp(sourceDir, destinationDir, { recursive: true });
    return;
  }

  const index = JSON.parse(await readRemoteText(buildUrl(sourceUrl, "bundle-index.json")));
  for (const file of index.files) {
    const targetPath = path.join(destinationDir, file.path);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    const content = await readRemoteText(buildUrl(sourceUrl, file.path));
    await fs.writeFile(targetPath, content, "utf8");
  }
}

async function readRemoteText(url) {
  if (url.startsWith("file://")) {
    return fs.readFile(fileURLToPath(url), "utf8");
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}
