import fs from "node:fs/promises";
import path from "node:path";

export async function installClaudeBundle({ bundleDir, installDir }) {
  await copyTree(bundleDir, installDir);
  return {
    platform: "claude",
    installDir,
    entrypoint: path.join(installDir, ".claude-plugin", "plugin.json")
  };
}

async function copyTree(sourceDir, destinationDir) {
  await fs.rm(destinationDir, { recursive: true, force: true });
  await fs.mkdir(destinationDir, { recursive: true });
  await fs.cp(sourceDir, destinationDir, { recursive: true });
}
