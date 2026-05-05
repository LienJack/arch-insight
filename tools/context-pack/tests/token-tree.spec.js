import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildTokenTree, formatTokenTreeReport } from "../src/core/token-tree.js";

test("token tree returns distribution and report output", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "context-pack-token-tree-"));
  await mkdir(path.join(root, "src"), { recursive: true });
  await writeFile(path.join(root, "src", "a.txt"), "hello world\nhello", "utf8");
  await writeFile(path.join(root, "src", "b.txt"), "another file", "utf8");

  const result = await buildTokenTree({
    rootPath: root,
    files: ["src/a.txt", "src/b.txt"],
    tokenizerName: "cl100k_base"
  });

  assert.equal(result.totalFiles, 2);
  assert.equal(result.analyzedFiles, 2);
  assert.equal(result.tokenizer, "cl100k_base");
  assert.ok(result.totalTokens > 0);

  const report = formatTokenTreeReport(result);
  assert.match(report, /Token tree/);
  assert.match(report, /src/);
});

test("token tree handles empty file list", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "context-pack-token-empty-"));

  const result = await buildTokenTree({
    rootPath: root,
    files: [],
    tokenizerName: "cl100k_base"
  });

  assert.equal(result.totalTokens, 0);
  assert.equal(result.totalFiles, 0);
});
