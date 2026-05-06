import fs from "node:fs/promises";
import path from "node:path";

export async function loadPluginSource(sourceDir) {
  const manifestPath = path.join(sourceDir, "plugin.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const skillRoot = path.join(sourceDir, "skills", "arch-insight");
  const referencesRoot = path.join(skillRoot, "references");

  return {
    rootDir: sourceDir,
    manifestPath,
    manifest,
    skillRoot,
    referencesRoot,
    skillEntries: await loadDirectoryEntries(path.join(sourceDir, "skills")),
    runnerPath: path.join(referencesRoot, "RUNNER.md"),
    runnerContent: await fs.readFile(path.join(referencesRoot, "RUNNER.md"), "utf8"),
    promptEntries: await loadDirectoryEntries(path.join(referencesRoot, "prompts")),
    templateEntries: await loadDirectoryEntries(path.join(referencesRoot, "templates"))
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
