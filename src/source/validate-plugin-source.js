import fs from "node:fs/promises";
import path from "node:path";

const REQUIRED_FILES = [
  ".claude-plugin/plugin.json",
  "RUNNER.md",
  "skills/arch-insight/SKILL.md",
  "prompts/01_repo_intake.md",
  "prompts/02_design_philosophy_brain_dump.md",
  "prompts/03_ecosystem_atlas.md",
  "prompts/04_architecture_report.md",
  "prompts/05_narrative_article.md",
  "prompts/06_repo_overview_article.md",
  "templates/ARCHITECTURE_REPORT.md",
  "templates/BORROWABLE_PATTERNS.md",
  "templates/CORE_ABSTRACTIONS.md",
  "templates/DESIGN_PHILOSOPHY.md",
  "templates/MAIN_FLOW.md",
  "templates/NARRATIVE_ARTICLE.md",
  "templates/REPO_OVERVIEW_ARTICLE.md",
  "templates/TRADEOFFS.md"
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

  const manifest = JSON.parse(
    await fs.readFile(path.join(sourceDir, ".claude-plugin", "plugin.json"), "utf8")
  );

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
