import test from "node:test";
import assert from "node:assert/strict";
import { parseCliArgs, DEFAULT_OUTPUT_FILE } from "../src/cli/args.js";

test("args: default values enter package mode", () => {
  const parsed = parseCliArgs([]);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.mode, "package");
  assert.equal(parsed.value.input, ".");
  assert.equal(parsed.value.output, DEFAULT_OUTPUT_FILE);
});

test("args: mutual exclusion for token tree vs split/compress", () => {
  const parsed = parseCliArgs(["--token-count-tree", "--split", "100"]);
  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /cannot be combined/);
});

test("args: missing value fails with readable error", () => {
  const parsed = parseCliArgs(["--split"]);
  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /Argument error/);
});

test("args: include and ignore parse as pattern arrays", () => {
  const parsed = parseCliArgs([
    "--include",
    "src/**/*.js,README.md",
    "--ignore",
    "**/*.test.js",
    "--ignore",
    "docs/**"
  ]);

  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.value.include, ["src/**/*.js", "README.md"]);
  assert.deepEqual(parsed.value.ignore, ["**/*.test.js", "docs/**"]);
});
