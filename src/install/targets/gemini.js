import fs from "node:fs/promises";
import path from "node:path";

export async function installGeminiBundle({ bundleDir, installDir }) {
  await fs.rm(installDir, { recursive: true, force: true });
  await fs.mkdir(installDir, { recursive: true });

  await fs.cp(path.join(bundleDir, "skills", "arch-insight"), installDir, { recursive: true });
  await fs.copyFile(
    path.join(bundleDir, "skills", "arch-insight", "references", "RUNNER.md"),
    path.join(installDir, "RUNNER.md")
  );

  const manifestTarget = path.join(path.dirname(installDir), "..", "arch-insight", "install-manifest.json");
  await fs.mkdir(path.dirname(manifestTarget), { recursive: true });
  await fs.writeFile(
    manifestTarget,
    JSON.stringify(
      {
        installedAt: new Date().toISOString(),
        platform: "gemini",
        skillDir: installDir
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  return {
    platform: "gemini",
    installDir,
    entrypoint: path.join(installDir, "SKILL.md")
  };
}
