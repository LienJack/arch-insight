import test from "node:test";
import assert from "node:assert/strict";

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
