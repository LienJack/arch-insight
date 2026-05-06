import os from "node:os";
import path from "node:path";

export function resolvePlatformInstall({ platform, targetDir }) {
  if (targetDir) {
    return targetDir;
  }

  const home = os.homedir();

  switch (platform) {
    case "claude":
      return path.join(home, ".claude", "plugins", "local", "arch-insight");
    case "codex":
      return path.join(home, ".codex", "skills", "arch-insight");
    case "gemini":
      return path.join(home, ".gemini", "skills", "arch-insight");
    case "opencode":
      return path.join(home, ".config", "opencode", "skills", "arch-insight");
    case "pi":
      return path.join(home, ".pi", "agent", "skills", "arch-insight");
    case "kiro":
      return path.join(home, ".kiro", "skills", "arch-insight");
    case "cursor":
      return path.join(home, ".cursor", "plugins", "local", "arch-insight");
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
