import path from "node:path";

import { resolvePlatformInstall } from "./resolve-platform.js";
import { installClaudeBundle } from "./targets/claude.js";
import { installCodexBundle } from "./targets/codex.js";
import { installGeminiBundle } from "./targets/gemini.js";

const TARGET_INSTALLERS = {
  claude: installClaudeBundle,
  codex: installCodexBundle,
  gemini: installGeminiBundle
};

export async function installBundle({
  bundleDir,
  platform,
  targetDir
}) {
  const installer = TARGET_INSTALLERS[platform];
  if (!installer) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const resolvedInstallDir = resolvePlatformInstall({
    platform,
    targetDir
  });

  const bundleRoot = path.join(bundleDir, platform);
  return installer({
    bundleDir: bundleRoot,
    installDir: resolvedInstallDir
  });
}
