import fs from "node:fs/promises";
import path from "node:path";

export async function loadPluginSource(sourceDir) {
  const manifestPath = path.join(sourceDir, ".claude-plugin", "plugin.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

  return {
    rootDir: sourceDir,
    manifestPath,
    manifest,
    skillEntries: await loadDirectoryEntries(path.join(sourceDir, "skills")),
    promptEntries: await loadDirectoryEntries(path.join(sourceDir, "prompts")),
    templateEntries: await loadDirectoryEntries(path.join(sourceDir, "templates")),
    runnerPath: path.join(sourceDir, "RUNNER.md"),
    runnerContent: await fs.readFile(path.join(sourceDir, "RUNNER.md"), "utf8")
  };
}

async function loadDirectoryEntries(rootDir) {
  const entries = [];

  async function walk(currentDir) {
    const dirents = await fs.readdir(currentDir, { withFileTypes: true });
    for (const dirent of dirents) {
      const absolutePath = path.join(currentDir, dirent.name);
      if (dirent.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      entries.push({
        absolutePath,
        relativePath: path.relative(rootDir, absolutePath),
        content: await fs.readFile(absolutePath, "utf8")
      });
    }
  }

  await walk(rootDir);
  entries.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  return entries;
}
