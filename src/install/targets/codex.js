import fs from "node:fs/promises";
import path from "node:path";

export async function installCodexBundle({ bundleDir, installDir }) {
  await fs.rm(installDir, { recursive: true, force: true });
  await fs.mkdir(installDir, { recursive: true });

  await fs.cp(path.join(bundleDir, "skills"), installDir, { recursive: true });
  await fs.copyFile(path.join(bundleDir, "RUNNER.md"), path.join(installDir, "RUNNER.md"));
  await fs.cp(path.join(bundleDir, "templates"), path.join(installDir, "templates"), {
    recursive: true
  });

  const promptsSource = path.join(bundleDir, "prompts");
  const promptsTarget = path.join(path.dirname(path.dirname(installDir)), "prompts");
  await fs.mkdir(promptsTarget, { recursive: true });
  await copyFlatMarkdownFiles(promptsSource, promptsTarget, "arch-insight");

  return {
    platform: "codex",
    installDir,
    entrypoint: path.join(installDir, "arch-insight", "SKILL.md")
  };
}

async function copyFlatMarkdownFiles(sourceDir, destinationDir, prefix) {
  const dirents = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const dirent of dirents) {
    const absolutePath = path.join(sourceDir, dirent.name);
    if (dirent.isDirectory()) {
      await copyFlatMarkdownFiles(absolutePath, destinationDir, prefix);
      continue;
    }

    const baseName = `${prefix}-${dirent.name}`;
    await fs.copyFile(absolutePath, path.join(destinationDir, baseName));
  }
}
