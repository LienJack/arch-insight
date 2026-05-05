import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { buildBundles } from "../build/build-bundles.js";
import { loadPluginSource } from "../source/load-plugin-source.js";
import { buildReleaseManifest } from "./manifest.js";

const execFileAsync = promisify(execFile);

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
    const fileName = `arch-insight-${source.manifest.version}-${result.platform}.tar.gz`;
    const tarballPath = path.join(outputDir, fileName);

    await execFileAsync("tar", ["-czf", tarballPath, "-C", bundlesDir, result.platform]);

    bundleRecords.push({
      platform: result.platform,
      tarball: fileName,
      url: baseUrl ? `${baseUrl.replace(/\/$/, "")}/${fileName}` : fileName,
      bundleRoot: result.platform
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
