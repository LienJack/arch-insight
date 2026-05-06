import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { parseArgs } from "../src/cli/args.js";
import { runCli } from "../src/cli/run.js";

test("CLI 默认帮助页能展示主入口", () => {
  const parsed = parseArgs([]);
  assert.equal(parsed.command, "help");
  assert.match(parsed.helpText, /build/);
  assert.match(parsed.helpText, /install/);
});

test("未知平台会返回清晰错误", () => {
  assert.throws(
    () => parseArgs(["install", "--platform", "unknown"]),
    /Unsupported platform/
  );
  assert.throws(
    () => parseArgs(["install-release", "--platform", "unknown"]),
    /Unsupported platform/
  );
  assert.throws(
    () => parseArgs(["update", "--platform", "unknown"]),
    /Unsupported platform/
  );
  assert.throws(
    () => parseArgs(["upgrade", "--platform", "unknown"]),
    /Unsupported platform/
  );
});

test("update/upgrade 命令会被正确解析", () => {
  const update = parseArgs(["update", "--platform", "codex"]);
  const upgrade = parseArgs(["upgrade", "--platform", "codex"]);

  assert.equal(update.command, "update");
  assert.deepEqual(update.options.platforms, ["codex"]);
  assert.equal(upgrade.command, "upgrade");
  assert.deepEqual(upgrade.options.platforms, ["codex"]);
});

test("新平台参数可被 CLI 正确解析", () => {
  const parsed = parseArgs([
    "install",
    "--platform",
    "opencode",
    "--platform",
    "pi",
    "--platform",
    "kiro",
    "--platform",
    "cursor"
  ]);

  assert.equal(parsed.command, "install");
  assert.deepEqual(parsed.options.platforms, ["opencode", "pi", "kiro", "cursor"]);
});

test("bin 层能把参数传到 run.js", async () => {
  let stdout = "";
  let stderr = "";
  const exitCode = await runCli(["help", "--json"], {
    cwd: process.cwd(),
    stdout: { write(chunk) { stdout += chunk; } },
    stderr: { write(chunk) { stderr += chunk; } },
    env: process.env
  });

  assert.equal(exitCode, 0);
  assert.equal(stderr, "");
  assert.match(stdout, /"help"/);
});

test("install-release 默认使用包内 release 源完成安装", async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-cli-release-"));
  const targetDir = path.join(workspace, ".codex", "skills", "arch-insight");
  const cacheDir = path.join(workspace, "cache");
  let stdout = "";
  let stderr = "";

  const exitCode = await runCli([
    "install-release",
    "--platform",
    "codex",
    "--target-dir",
    targetDir,
    "--cache-dir",
    cacheDir,
    "--json"
  ], {
    cwd: process.cwd(),
    stdout: { write(chunk) { stdout += chunk; } },
    stderr: { write(chunk) { stderr += chunk; } },
    env: process.env
  });

  assert.equal(exitCode, 0);
  assert.equal(stderr, "");

  const result = JSON.parse(stdout);
  assert.equal(result.command, "install-release");
  assert.match(result.releaseBaseUrl, /^file:\/\//);
  assert.equal(result.platformCount, 1);
  assert.equal(result.installed[0].platform, "codex");

  const skillFile = await fs.readFile(path.join(targetDir, "SKILL.md"), "utf8");
  assert.match(skillFile, /# arch-insight/);
});
