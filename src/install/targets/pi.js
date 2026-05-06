import fs from "node:fs/promises";
import path from "node:path";

export async function installPiBundle({ bundleDir, installDir }) {
  await fs.rm(installDir, { recursive: true, force: true });
  await fs.mkdir(installDir, { recursive: true });

  await fs.cp(path.join(bundleDir, "skills", "arch-insight"), installDir, { recursive: true });

  return {
    platform: "pi",
    installDir,
    entrypoint: path.join(installDir, "SKILL.md")
  };
}
