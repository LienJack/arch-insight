import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildReleaseArtifacts } from "../src/release/build-release-artifacts.js";
import { buildBundles } from "../src/build/build-bundles.js";
import { installBundle } from "../src/install/install-bundle.js";

const SOURCE_DIR = path.resolve(".agents");

test("七平台 x npm 安装矩阵具备最小成功面", async () => {
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
  const opencode = await installBundle({
    bundleDir: distDir,
    platform: "opencode",
    targetDir: path.join(workspace, ".config", "opencode", "skills", "arch-insight")
  });
  const pi = await installBundle({
    bundleDir: distDir,
    platform: "pi",
    targetDir: path.join(workspace, ".pi", "agent", "skills", "arch-insight")
  });
  const kiro = await installBundle({
    bundleDir: distDir,
    platform: "kiro",
    targetDir: path.join(workspace, ".kiro", "skills", "arch-insight")
  });
  const cursor = await installBundle({
    bundleDir: distDir,
    platform: "cursor",
    targetDir: path.join(workspace, ".cursor", "plugins", "local", "arch-insight")
  });

  assert.match(claude.entrypoint, /\.claude-plugin\/plugin\.json$/);
  assert.match(codex.entrypoint, /SKILL\.md$/);
  assert.match(gemini.entrypoint, /SKILL\.md$/);
  assert.match(opencode.entrypoint, /SKILL\.md$/);
  assert.match(pi.entrypoint, /SKILL\.md$/);
  assert.match(kiro.entrypoint, /SKILL\.md$/);
  assert.match(cursor.entrypoint, /\.cursor-plugin\/plugin\.json$/);

  const codexRunner = await fs.readFile(
    path.join(
      workspace,
      ".codex",
      "skills",
      "arch-insight",
      "references",
      "RUNNER.md"
    ),
    "utf8"
  );
  const geminiRunner = await fs.readFile(
    path.join(workspace, ".gemini", "skills", "arch-insight", "references", "RUNNER.md"),
    "utf8"
  );
  const codexTemplate = await fs.readFile(
    path.join(
      workspace,
      ".codex",
      "skills",
      "arch-insight",
      "references",
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
  assert.equal(manifestFile.bundles.length, 7);
  assert.equal(manifestFile.bundles[0].bundleDir.length > 0, true);
});
