import test from "node:test";
import assert from "node:assert/strict";
import { applyFilters } from "../src/core/apply-filters.js";

const allFiles = [
  "README.md",
  "src/cli/run.js",
  "src/core/apply-filters.js",
  "tests/filters.spec.js",
  "docs/guide.md"
];

test("filters: include and ignore produce stable selected set", () => {
  const result = applyFilters(allFiles, {
    includePatterns: ["src/**/*", "README.md"],
    ignorePatterns: ["**/apply-filters.js"]
  });

  assert.deepEqual(result.files, ["README.md", "src/cli/run.js"]);
  assert.deepEqual(result.warnings, []);
});

test("filters: empty result when everything ignored", () => {
  const result = applyFilters(allFiles, {
    ignorePatterns: ["**/*"]
  });

  assert.deepEqual(result.files, []);
});
