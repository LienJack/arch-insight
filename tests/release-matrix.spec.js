import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildReleaseArtifacts } from "../src/release/build-release-artifacts.js";
import { buildBundles } from "../src/build/build-bundles.js";
import { installBundle } from "../src/install/install-bundle.js";

const SOURCE_DIR = path.resolve("plugins/arch-insight");

test("三平台 x npm 安装矩阵具备最小成功面", async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-matrix-"));
  const distDir = path.join(workspace, "dist");
  await buildBundles({
    sourceDir: SOURCE_DIR,
    outputDir: distDir
  });

  const claude = await installBundle({
    bundleDir: distDir,
    platform: "claude",
    targetDir: path.join(workspace, ".claude", "plugins", "local", "arch-insight")
  });
  const codex = await installBundle({
    bundleDir: distDir,
    platform: "codex",
    targetDir: path.join(workspace, ".codex", "skills", "arch-insight")
  });
  const gemini = await installBundle({
    bundleDir: distDir,
    platform: "gemini",
    targetDir: path.join(workspace, ".gemini", "skills", "arch-insight")
  });

  assert.match(claude.entrypoint, /\.claude-plugin\/plugin\.json$/);
  assert.match(codex.entrypoint, /SKILL\.md$/);
  assert.match(gemini.entrypoint, /SKILL\.md$/);

  const codexRunner = await fs.readFile(
    path.join(workspace, ".codex", "skills", "arch-insight", "RUNNER.md"),
    "utf8"
  );
  const geminiRunner = await fs.readFile(
    path.join(workspace, ".gemini", "skills", "arch-insight", "RUNNER.md"),
    "utf8"
  );
  const codexTemplate = await fs.readFile(
    path.join(
      workspace,
      ".codex",
      "skills",
      "arch-insight",
      "templates",
      "ARCHITECTURE_REPORT.md"
    ),
    "utf8"
  );

  assert.match(codexRunner, /arch-insight Runner/);
  assert.match(geminiRunner, /arch-insight Runner/);
  assert.match(codexTemplate, /#|##|架构|Architecture/);
});

test("只更新权威源而未重建 release 产物时，验证矩阵能发现版本漂移", async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-release-"));
  const releaseDir = path.join(workspace, "release");
  const manifest = await buildReleaseArtifacts({
    sourceDir: SOURCE_DIR,
    outputDir: releaseDir,
    baseUrl: ""
  });

  const manifestFile = JSON.parse(
    await fs.readFile(path.join(releaseDir, "install-manifest.json"), "utf8")
  );
  assert.equal(manifestFile.version, manifest.version);
  assert.equal(manifestFile.bundles.length, 3);
});
