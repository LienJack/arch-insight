import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildBundles } from "../src/build/build-bundles.js";
import { installBundle } from "../src/install/install-bundle.js";

const SOURCE_DIR = path.resolve("plugins/arch-insight");

test("统一 CLI 安装链路能定位正确 bundle 并完成 Codex 安装", async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-install-"));
  const bundlesDir = path.join(workspace, "dist");
  const targetDir = path.join(workspace, ".codex", "skills", "arch-insight");

  await buildBundles({
    sourceDir: SOURCE_DIR,
    outputDir: bundlesDir
  });

  const result = await installBundle({
    bundleDir: bundlesDir,
    platform: "codex",
    targetDir
  });

  assert.equal(result.platform, "codex");
  const skillFile = await fs.readFile(path.join(targetDir, "arch-insight", "SKILL.md"), "utf8");
  assert.match(skillFile, /# arch-insight/);
});

test("未知平台安装会直接失败", async () => {
  await assert.rejects(
    () => installBundle({ bundleDir: "dist", platform: "unknown" }),
    /Unsupported platform/
  );
});
