import { minimatch } from "minimatch";

function normalizePath(input) {
  return input
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/^\//, "");
}

function expandPattern(pattern) {
  if (pattern.includes("/")) {
    return [pattern];
  }
  return [pattern, `**/${pattern}`];
}

function matchesAnyPattern(filePath, patterns) {
  for (const pattern of patterns) {
    if (minimatch(filePath, pattern, { dot: true })) {
      return true;
    }
  }
  return false;
}

export function applyFilters(allFiles, { includePatterns = [], ignorePatterns = [], stdinFiles = [] }) {
  const normalizedIncludes = includePatterns.flatMap((pattern) => expandPattern(normalizePath(pattern)));
  const normalizedIgnores = ignorePatterns.flatMap((pattern) => expandPattern(normalizePath(pattern)));

  let selected = [...allFiles];

  const normalizedStdin = stdinFiles.map((value) => normalizePath(value)).filter(Boolean);
  const warnings = [];

  if (normalizedStdin.length > 0) {
    const available = new Set(allFiles);
    const stdinSet = new Set();

    for (const file of normalizedStdin) {
      if (!available.has(file)) {
        warnings.push(`stdin selection ignored missing file: ${file}`);
        continue;
      }
      stdinSet.add(file);
    }

    selected = selected.filter((file) => stdinSet.has(file));
  }

  if (normalizedIncludes.length > 0) {
    selected = selected.filter((file) => matchesAnyPattern(file, normalizedIncludes));
  }

  if (normalizedIgnores.length > 0) {
    selected = selected.filter((file) => !matchesAnyPattern(file, normalizedIgnores));
  }

  return {
    files: selected.sort((a, b) => a.localeCompare(b)),
    warnings
  };
}
