import test from "node:test";
import assert from "node:assert/strict";
import { applyFilters } from "../src/core/apply-filters.js";

const allFiles = ["README.md", "src/a.js", "src/b.js", "docs/intro.md"];

test("stdin selection takes precedence over full traversal", () => {
  const result = applyFilters(allFiles, {
    stdinFiles: ["src/b.js", "README.md"]
  });

  assert.deepEqual(result.files, ["README.md", "src/b.js"]);
});

test("stdin missing file produces warning and keeps valid files", () => {
  const result = applyFilters(allFiles, {
    stdinFiles: ["src/a.js", "missing.js"]
  });

  assert.deepEqual(result.files, ["src/a.js"]);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /missing file/);
});

test("stdin + ignore still applies ignore rules", () => {
  const result = applyFilters(allFiles, {
    stdinFiles: ["src/a.js", "src/b.js"],
    ignorePatterns: ["**/b.js"]
  });

  assert.deepEqual(result.files, ["src/a.js"]);
});
