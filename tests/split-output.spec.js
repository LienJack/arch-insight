import test from "node:test";
import assert from "node:assert/strict";
import { splitPackageOutput } from "../src/core/split-output.js";

function makeSection(index) {
  return {
    file: `src/file-${index}.js`,
    content: `### File: src/file-${index}.js\n\`\`\`js\nconsole.log(${index});\n\`\`\`\n\n`
  };
}

test("split output emits multiple consumable parts", () => {
  const sections = Array.from({ length: 10 }, (_, index) => makeSection(index + 1));
  const parts = splitPackageOutput({
    header: "# Context Pack\n\n",
    sections,
    maxChars: 200
  });

  assert.ok(parts.length > 1);
  assert.equal(parts[0].part, 1);
  assert.equal(parts[parts.length - 1].total, parts.length);
  assert.match(parts[0].content, /Part 1\//);
});

test("split output tolerates very large max size", () => {
  const parts = splitPackageOutput({
    header: "header\n",
    sections: [makeSection(1), makeSection(2)],
    maxChars: 100000
  });

  assert.equal(parts.length, 1);
  assert.equal(parts[0].files.length, 2);
});
