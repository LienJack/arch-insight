import { readFile } from "node:fs/promises";
import path from "node:path";

function isLikelyBinary(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8000));
  for (const byte of sample) {
    if (byte === 0) {
      return true;
    }
  }
  return false;
}

function inferLanguage(relativePath) {
  const extension = path.extname(relativePath).slice(1);
  return extension || "text";
}

export async function buildPackage({ rootPath, files }) {
  const headerLines = [
    "# Context Pack",
    "",
    `Generated at: ${new Date().toISOString()}`,
    `Root path: ${rootPath}`,
    `File count: ${files.length}`,
    "",
    "## File List",
    ...files.map((file) => `- ${file}`),
    "",
    "## File Contents",
    ""
  ];

  const sections = [];

  for (const relativePath of files) {
    const absolutePath = path.join(rootPath, relativePath);
    const buffer = await readFile(absolutePath);

    let body;
    if (isLikelyBinary(buffer)) {
      body = "[binary file omitted]";
    } else {
      body = buffer.toString("utf8");
    }

    const language = inferLanguage(relativePath);

    sections.push({
      file: relativePath,
      content: [
        `### File: ${relativePath}`,
        `\`\`\`${language}`,
        body,
        "\`\`\`",
        ""
      ].join("\n")
    });
  }

  return {
    header: `${headerLines.join("\n")}\n`,
    sections,
    content: `${headerLines.join("\n")}\n${sections.map((section) => section.content).join("")}`
  };
}
