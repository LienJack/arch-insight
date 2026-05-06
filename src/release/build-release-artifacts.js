import fs from "node:fs/promises";
import path from "node:path";

import { buildBundles } from "../build/build-bundles.js";
import { loadPluginSource } from "../source/load-plugin-source.js";
import { buildReleaseManifest } from "./manifest.js";

export async function buildReleaseArtifacts({
  sourceDir,
  outputDir,
  baseUrl
}) {
  const bundlesDir = path.join(outputDir, "bundles");
  const source = await loadPluginSource(sourceDir);
  const buildResults = await buildBundles({
    sourceDir,
    outputDir: bundlesDir
  });

  const bundleRecords = [];
  for (const result of buildResults) {
    const bundleIndex = await buildBundleIndex(path.join(bundlesDir, result.platform));
    await fs.writeFile(
      path.join(bundlesDir, result.platform, "bundle-index.json"),
      JSON.stringify(bundleIndex, null, 2) + "\n",
      "utf8"
    );

    bundleRecords.push({
      platform: result.platform,
      bundleDir: `bundles/${result.platform}`,
      url: baseUrl ? `${baseUrl.replace(/\/$/, "")}/bundles/${result.platform}` : `bundles/${result.platform}`,
      fileCount: bundleIndex.files.length
    });
  }

  const manifest = buildReleaseManifest({
    version: source.manifest.version,
    baseUrl,
    bundles: bundleRecords
  });

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, "install-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  );

  return manifest;
}

async function buildBundleIndex(bundleRoot) {
  const files = [];

  async function walk(currentDir) {
    const dirents = await fs.readdir(currentDir, { withFileTypes: true });
    for (const dirent of dirents) {
      const absolutePath = path.join(currentDir, dirent.name);
      if (dirent.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      if (dirent.name === "bundle-index.json") {
        continue;
      }

      files.push({
        path: path.relative(bundleRoot, absolutePath).replaceAll(path.sep, "/")
      });
    }
  }

  await walk(bundleRoot);
  files.sort((left, right) => left.path.localeCompare(right.path));
  return { files };
}
