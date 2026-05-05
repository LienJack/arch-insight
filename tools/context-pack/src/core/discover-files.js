import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const DEFAULT_IGNORED_DIRS = new Set([".git", "node_modules"]);

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

async function walkDirectory(rootDir, currentDir, files) {
  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      if (DEFAULT_IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      await walkDirectory(rootDir, absolutePath, files);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const relativePath = toPosixPath(path.relative(rootDir, absolutePath));
    files.push(relativePath);
  }
}

export async function discoverFiles(rootPath) {
  const rootStats = await stat(rootPath);

  if (rootStats.isFile()) {
    return [path.basename(rootPath)];
  }

  const files = [];
  await walkDirectory(rootPath, rootPath, files);
  files.sort((a, b) => a.localeCompare(b));
  return files;
}
