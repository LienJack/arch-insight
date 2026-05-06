import path from "node:path";
import fs from "node:fs/promises";

import { resolvePlatformInstall } from "./resolve-platform.js";
import { installClaudeBundle } from "./targets/claude.js";
import { installCodexBundle } from "./targets/codex.js";
import { installGeminiBundle } from "./targets/gemini.js";
import { installOpenCodeBundle } from "./targets/opencode.js";
import { installPiBundle } from "./targets/pi.js";
import { installKiroBundle } from "./targets/kiro.js";
import { installCursorBundle } from "./targets/cursor.js";

const TARGET_INSTALLERS = {
  claude: installClaudeBundle,
  codex: installCodexBundle,
  gemini: installGeminiBundle,
  opencode: installOpenCodeBundle,
  pi: installPiBundle,
  kiro: installKiroBundle,
  cursor: installCursorBundle
};

export async function installBundle({
  bundleDir,
  platform,
  targetDir,
  cwd,
  env,
  registerClaudePlugin
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
  const result = await installer({
    bundleDir: bundleRoot,
    installDir: resolvedInstallDir,
    cwd,
    env,
    registerWithHost: platform === "claude" ? Boolean(registerClaudePlugin) : false
  });

  await fs.access(result.entrypoint);
  return {
    ...result,
    verified: true
  };
}
