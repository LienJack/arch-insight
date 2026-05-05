import test from "node:test";
import assert from "node:assert/strict";
import { gunzipSync } from "node:zlib";
import { gzipContent } from "../src/core/compress-output.js";

test("compress output can round-trip", () => {
  const input = "context pack test payload";
  const gz = gzipContent(input);
  const restored = gunzipSync(gz).toString("utf8");

  assert.equal(restored, input);
});
