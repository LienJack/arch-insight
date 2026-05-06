import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildBundles } from "../src/build/build-bundles.js";

const SOURCE_DIR = path.resolve(".agents");

test("同一套源可稳定生成三平台 bundle", async () => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-build-"));
  const result = await buildBundles({
    sourceDir: SOURCE_DIR,
    outputDir
  });

  assert.equal(result.length, 3);

  const claudeManifest = await fs.readFile(
    path.join(outputDir, "claude", ".claude-plugin", "plugin.json"),
    "utf8"
  );
  const codexManifest = await fs.readFile(
    path.join(outputDir, "codex", ".codex-plugin", "plugin.json"),
    "utf8"
  );
  const geminiManifest = await fs.readFile(
    path.join(outputDir, "gemini", "gemini-extension.json"),
    "utf8"
  );

  assert.match(claudeManifest, /"name": "arch-insight"/);
  assert.match(codexManifest, /"skills": "\.\/skills\/"/);
  assert.match(geminiManifest, /"gemini-extension\.json"|\"skills\"/);
});

test("未知构建目标不会产出半成品", async () => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-build-"));
  await assert.rejects(
    () =>
      buildBundles({
        sourceDir: SOURCE_DIR,
        outputDir,
        platform: "unknown"
      }),
    /Unknown build target/
  );
});
