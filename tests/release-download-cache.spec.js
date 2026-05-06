import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { downloadReleaseBundle } from "../src/release/download-release-bundle.js";

test("release 下载会写入缓存，并在同版本同平台命中复用", async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-cache-test-"));
  const releaseRoot = path.join(workspace, "release");
  const bundlesRoot = path.join(releaseRoot, "bundles", "codex");
  const cacheRoot = path.join(workspace, "cache");

  await fs.mkdir(path.join(bundlesRoot, "skills", "arch-insight"), { recursive: true });
  await fs.writeFile(
    path.join(bundlesRoot, "skills", "arch-insight", "SKILL.md"),
    "# arch-insight\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(bundlesRoot, "bundle-index.json"),
    JSON.stringify({ files: [{ path: "skills/arch-insight/SKILL.md" }] }, null, 2) + "\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(releaseRoot, "install-manifest.json"),
    JSON.stringify(
      {
        version: "9.9.9",
        bundles: [
          {
            platform: "codex",
            bundleDir: "bundles/codex",
            fileCount: 1
          }
        ]
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  const releaseBaseUrl = `file://${releaseRoot}`;

  const first = await downloadReleaseBundle({
    platform: "codex",
    releaseBaseUrl,
    cacheDir: cacheRoot
  });

  assert.equal(first.fromCache, false);
  assert.match(first.cacheReason, /Downloaded bundle/);

  await fs.rm(path.join(releaseRoot, "bundles"), { recursive: true, force: true });

  const second = await downloadReleaseBundle({
    platform: "codex",
    releaseBaseUrl,
    cacheDir: cacheRoot
  });

  assert.equal(second.fromCache, true);
  assert.match(second.cacheReason, /Reused local bundle/);

  const installedSkill = await fs.readFile(
    path.join(second.downloadedPlatformDir, "skills", "arch-insight", "SKILL.md"),
    "utf8"
  );
  assert.match(installedSkill, /# arch-insight/);

  const registry = JSON.parse(
    await fs.readFile(path.join(cacheRoot, "cache-manifest.json"), "utf8")
  );
  assert.equal(Array.isArray(registry.entries), true);
  assert.equal(registry.entries.length > 0, true);
});
