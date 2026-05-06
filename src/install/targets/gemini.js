import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

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

  const visibility = await detectGeminiVisibility(installDir);

  return {
    platform: "gemini",
    installDir,
    entrypoint: path.join(installDir, "SKILL.md"),
    visibilityCheck: visibility
  };
}

async function detectGeminiVisibility(installDir) {
  const verifyCommand = "gemini skills list | rg -n 'arch-insight|Skill conflict detected'";
  const defaultFailureHint = "If this fails, run `gemini skills install <skill-path> --scope user`, or restart Gemini and re-run the installer.";
  const conflictFailureHint = "Gemini detected same-name override. Keep only one source of `arch-insight` (prefer project `.agents/skills/arch-insight`) or uninstall the user-scoped duplicate.";
  const installedSkillPath = path.resolve(installDir, "SKILL.md");

  try {
    const { stdout, stderr } = await execFileAsync("gemini", ["skills", "list"], {
      env: process.env
    });
    const text = `${stdout ?? ""}\n${stderr ?? ""}`;
    const hasSkill = /\barch-insight\b/.test(text);
    const conflict = /Skill conflict detected:[\s\S]*arch-insight/.test(text);
    const skillBlockMatch = /arch-insight \[Enabled\][\s\S]*?Location:\s+([^\n]+)/.exec(text);
    const resolvedLocation = skillBlockMatch?.[1]?.trim() ?? "";
    const ok = hasSkill && !conflict;

    return {
      command: verifyCommand,
      ok,
      conflictDetected: conflict,
      resolvedLocation,
      expectedLocation: installedSkillPath,
      failureHint: conflict ? conflictFailureHint : defaultFailureHint,
      message: conflict
        ? "Gemini found duplicate `arch-insight` definitions; one is overriding the other."
        : ok
          ? ""
          : "Gemini skill list does not show a clean `arch-insight` entry yet."
    };
  } catch {
    return {
      command: verifyCommand,
      ok: false,
      conflictDetected: false,
      resolvedLocation: "",
      expectedLocation: installedSkillPath,
      failureHint: defaultFailureHint,
      message: "Could not run `gemini skills list` during install."
    };
  }
}
