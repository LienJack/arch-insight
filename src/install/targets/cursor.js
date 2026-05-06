import fs from "node:fs/promises";
import path from "node:path";

export async function installCursorBundle({ bundleDir, installDir }) {
  await fs.rm(installDir, { recursive: true, force: true });
  await fs.mkdir(installDir, { recursive: true });

  await fs.cp(bundleDir, installDir, { recursive: true });

  return {
    platform: "cursor",
    installDir,
    entrypoint: path.join(installDir, ".cursor-plugin", "plugin.json")
  };
}
