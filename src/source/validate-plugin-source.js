import fs from "node:fs/promises";
import path from "node:path";

const REQUIRED_FILES = [
  "plugin.json",
  "skills/arch-insight/SKILL.md",
  "skills/arch-insight/references/RUNNER.md",
  "skills/arch-insight/references/prompts/01_repo_intake.md",
  "skills/arch-insight/references/prompts/02_design_philosophy_brain_dump.md",
  "skills/arch-insight/references/prompts/03_ecosystem_atlas.md",
  "skills/arch-insight/references/prompts/04_architecture_report.md",
  "skills/arch-insight/references/prompts/05_narrative_article.md",
  "skills/arch-insight/references/prompts/06_repo_overview_article.md",
  "skills/arch-insight/references/templates/ARCHITECTURE_REPORT.md",
  "skills/arch-insight/references/templates/BORROWABLE_PATTERNS.md",
  "skills/arch-insight/references/templates/CORE_ABSTRACTIONS.md",
  "skills/arch-insight/references/templates/DESIGN_PHILOSOPHY.md",
  "skills/arch-insight/references/templates/MAIN_FLOW.md",
  "skills/arch-insight/references/templates/NARRATIVE_ARTICLE.md",
  "skills/arch-insight/references/templates/REPO_OVERVIEW_ARTICLE.md",
  "skills/arch-insight/references/templates/TRADEOFFS.md"
];

export async function validatePluginSource(sourceDir) {
  const missingFiles = [];

  for (const relativePath of REQUIRED_FILES) {
    const absolutePath = path.join(sourceDir, relativePath);
    try {
      await fs.access(absolutePath);
    } catch {
      missingFiles.push(relativePath);
    }
  }

  if (missingFiles.length > 0) {
    throw new Error(`Plugin source is incomplete. Missing: ${missingFiles.join(", ")}`);
  }

  const manifest = JSON.parse(await fs.readFile(path.join(sourceDir, "plugin.json"), "utf8"));

  if (!manifest.name || !manifest.version || !manifest.skills) {
    throw new Error("Plugin manifest must include name, version, and skills.");
  }

  const rootSkillPath = path.resolve(sourceDir, "skills/arch-insight/SKILL.md");
  const pluginSkillPath = path.resolve(sourceDir, manifest.skills, "arch-insight", "SKILL.md");
  if (rootSkillPath !== pluginSkillPath) {
    throw new Error("Plugin manifest skills path does not point at the canonical skill entry.");
  }

  return {
    manifest,
    requiredFiles: [...REQUIRED_FILES]
  };
}
