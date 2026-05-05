import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { validatePluginSource } from "../src/source/validate-plugin-source.js";
import { loadPluginSource } from "../src/source/load-plugin-source.js";

const SOURCE_DIR = path.resolve("plugins/arch-insight");

test("插件源包含可识别的核心资产", async () => {
  const result = await validatePluginSource(SOURCE_DIR);
  assert.equal(result.manifest.name, "arch-insight");
  assert.ok(result.requiredFiles.length > 5);
});

test("缺少关键资产时源校验明确失败", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-source-"));
  await fs.cp(SOURCE_DIR, tempDir, { recursive: true });
  await fs.rm(path.join(tempDir, "prompts", "01_repo_intake.md"));

  await assert.rejects(
    () => validatePluginSource(tempDir),
    /Missing: prompts\/01_repo_intake\.md/
  );
});

test("插件源读取结果可直接被后续构建消费", async () => {
  const source = await loadPluginSource(SOURCE_DIR);
  assert.match(source.runnerContent, /arch-insight Runner/);
  assert.ok(source.skillEntries.some((entry) => entry.relativePath === "arch-insight/SKILL.md"));
});
