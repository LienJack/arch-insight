import { readFile } from "node:fs/promises";
import path from "node:path";
import { getEncoding } from "js-tiktoken";

function isLikelyBinary(buffer) {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8000));
  for (const byte of sample) {
    if (byte === 0) {
      return true;
    }
  }
  return false;
}

function createNode(name, type) {
  return {
    name,
    type,
    tokens: 0,
    children: new Map()
  };
}

function finalizeNode(node) {
  const children = Array.from(node.children.values()).map((child) => finalizeNode(child));
  children.sort((a, b) => {
    if (b.tokens !== a.tokens) {
      return b.tokens - a.tokens;
    }
    return a.name.localeCompare(b.name);
  });
  return {
    name: node.name,
    type: node.type,
    tokens: node.tokens,
    children
  };
}

function addFileTokenCount(root, relativePath, tokenCount) {
  root.tokens += tokenCount;

  const parts = relativePath.split("/");
  let cursor = root;

  for (let index = 0; index < parts.length; index += 1) {
    const segment = parts[index];
    const isFile = index === parts.length - 1;

    if (!cursor.children.has(segment)) {
      cursor.children.set(segment, createNode(segment, isFile ? "file" : "directory"));
    }

    cursor = cursor.children.get(segment);
    cursor.tokens += tokenCount;
  }
}

export async function buildTokenTree({ rootPath, files, tokenizerName }) {
  const encoding = getEncoding(tokenizerName);
  const root = createNode(".", "directory");

  const skippedBinary = [];

  for (const relativePath of files) {
    const absolutePath = path.join(rootPath, relativePath);
    const contentBuffer = await readFile(absolutePath);

    if (isLikelyBinary(contentBuffer)) {
      skippedBinary.push(relativePath);
      continue;
    }

    const text = contentBuffer.toString("utf8");
    const tokenCount = encoding.encode(text).length;
    addFileTokenCount(root, relativePath, tokenCount);
  }

  return {
    tokenizer: tokenizerName,
    totalTokens: root.tokens,
    totalFiles: files.length,
    analyzedFiles: files.length - skippedBinary.length,
    skippedBinary,
    tree: finalizeNode(root)
  };
}

function formatNodeLines(node, depth = 0) {
  const indent = "  ".repeat(depth);
  const icon = node.type === "directory" ? "📁" : "📄";
  const lines = [`${indent}${icon} ${node.name} (${node.tokens} tokens)`];

  for (const child of node.children) {
    lines.push(...formatNodeLines(child, depth + 1));
  }

  return lines;
}

export function formatTokenTreeReport(result) {
  const lines = [
    `Token tree (tokenizer: ${result.tokenizer})`,
    `Total files considered: ${result.totalFiles}`,
    `Files analyzed: ${result.analyzedFiles}`,
    `Total tokens: ${result.totalTokens}`,
    ""
  ];

  if (result.skippedBinary.length > 0) {
    lines.push(`Skipped binary files (${result.skippedBinary.length}):`);
    for (const file of result.skippedBinary) {
      lines.push(`- ${file}`);
    }
    lines.push("");
  }

  lines.push(...formatNodeLines(result.tree));
  return `${lines.join("\n")}\n`;
}
