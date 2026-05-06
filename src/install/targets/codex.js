import fs from "node:fs/promises";
import path from "node:path";

export async function installCodexBundle({ bundleDir, installDir }) {
  await fs.rm(installDir, { recursive: true, force: true });
  await fs.mkdir(installDir, { recursive: true });

  await fs.cp(path.join(bundleDir, "skills", "arch-insight"), installDir, { recursive: true });

  const verifyCommand = "test -f ~/.codex/skills/arch-insight/SKILL.md && ls ~/.codex/skills | rg '^arch-insight$'";
  let visible = false;
  let visibilityMessage = "";
  try {
    await fs.access(path.join(installDir, "SKILL.md"));
    const siblings = await fs.readdir(path.dirname(installDir));
    visible = siblings.includes(path.basename(installDir));
  } catch {
    visible = false;
  }

  if (!visible) {
    visibilityMessage = "Codex skill installed but visibility check failed. Run the verifyCommand, then restart Codex and run `/skills`.";
  }

  return {
    platform: "codex",
    installDir,
    entrypoint: path.join(installDir, "SKILL.md"),
    visibilityCheck: {
      command: verifyCommand,
      ok: visible,
      failureHint: "If this fails, reinstall with `npx arch-insight install-release --platform codex` and restart Codex.",
      message: visibilityMessage
    }
  };
}
