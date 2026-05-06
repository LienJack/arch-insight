import fs from "node:fs/promises";
import path from "node:path";

import { buildClaudeBundle } from "./targets/claude.js";
import { buildCodexBundle } from "./targets/codex.js";
import { buildGeminiBundle } from "./targets/gemini.js";
import { buildOpenCodeBundle } from "./targets/opencode.js";
import { buildPiBundle } from "./targets/pi.js";
import { buildKiroBundle } from "./targets/kiro.js";
import { buildCursorBundle } from "./targets/cursor.js";
import { loadPluginSource } from "../source/load-plugin-source.js";
import { validatePluginSource } from "../source/validate-plugin-source.js";

const TARGET_BUILDERS = {
  claude: buildClaudeBundle,
  codex: buildCodexBundle,
  gemini: buildGeminiBundle,
  opencode: buildOpenCodeBundle,
  pi: buildPiBundle,
  kiro: buildKiroBundle,
  cursor: buildCursorBundle
};

export async function buildBundles({
  sourceDir,
  outputDir,
  platform
}) {
  await validatePluginSource(sourceDir);
  const source = await loadPluginSource(sourceDir);

  const targets = platform ? [platform] : Object.keys(TARGET_BUILDERS);
  const manifests = [];

  for (const target of targets) {
    const bundle = TARGET_BUILDERS[target]?.(source);
    if (!bundle) {
      throw new Error(`Unknown build target: ${target}`);
    }

    const bundleRoot = path.join(outputDir, target);
    await writeBundle(bundleRoot, bundle.files);
    manifests.push({
      platform: target,
      bundleRoot,
      fileCount: bundle.files.length,
      version: source.manifest.version
    });
  }

  return manifests;
}

async function writeBundle(bundleRoot, files) {
  await fs.rm(bundleRoot, { recursive: true, force: true });
  await fs.mkdir(bundleRoot, { recursive: true });

  for (const file of files) {
    const destination = path.join(bundleRoot, file.path);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, file.content, "utf8");
  }
}
