import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function downloadReleaseBundle({
  platform,
  releaseBaseUrl,
  tempDir
}) {
  const workingRoot = tempDir
    ? path.resolve(tempDir)
    : await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-release-"));
  await fs.mkdir(workingRoot, { recursive: true });

  const manifestUrl = buildUrl(releaseBaseUrl, "install-manifest.json");
  const manifest = JSON.parse(await readRemoteText(manifestUrl));
  const bundleRecord = manifest.bundles.find((bundle) => bundle.platform === platform);

  if (!bundleRecord) {
    throw new Error(`No release bundle declared for platform: ${platform}`);
  }

  const bundleUrl = buildUrl(releaseBaseUrl, bundleRecord.bundleDir);
  const bundleDir = path.join(workingRoot, platform);

  await fs.rm(bundleDir, { recursive: true, force: true });
  await copyRemoteDirectory(bundleUrl, bundleDir);

  return {
    manifest,
    bundleDir: workingRoot,
    downloadedPlatformDir: bundleDir,
    releaseBaseUrl
  };
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
