import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const CLAUDE_MARKETPLACE_NAME = "arch-insight-local";

export async function installClaudeBundle({
  bundleDir,
  installDir,
  cwd = process.cwd(),
  env = process.env,
  registerWithHost = false
}) {
  await copyTree(bundleDir, installDir);

  const pluginId = `arch-insight@${CLAUDE_MARKETPLACE_NAME}`;
  if (registerWithHost) {
    await ensureMarketplaceRegistered({
      pluginRootDir: installDir,
      cwd,
      env
    });
    await ensurePluginInstalled({
      pluginId,
      cwd,
      env
    });
  }

  return {
    platform: "claude",
    installDir,
    entrypoint: path.join(installDir, ".claude-plugin", "plugin.json"),
    pluginId: registerWithHost ? pluginId : undefined
  };
}

async function copyTree(sourceDir, destinationDir) {
  await fs.rm(destinationDir, { recursive: true, force: true });
  await fs.mkdir(destinationDir, { recursive: true });
  await fs.cp(sourceDir, destinationDir, { recursive: true });
}

async function ensureMarketplaceRegistered({ pluginRootDir, cwd, env }) {
  await writeMarketplaceManifest(pluginRootDir);
  await runClaude([
    "plugin",
    "marketplace",
    "add",
    pluginRootDir
  ], { cwd, env });
  await runClaude([
    "plugin",
    "marketplace",
    "update",
    CLAUDE_MARKETPLACE_NAME
  ], { cwd, env });
}

async function ensurePluginInstalled({ pluginId, cwd, env }) {
  await runClaude([
    "plugin",
    "install",
    pluginId
  ], { cwd, env });
}

async function writeMarketplaceManifest(pluginRootDir) {
  const marketplaceDir = path.join(pluginRootDir, ".claude-plugin");
  const manifestPath = path.join(marketplaceDir, "marketplace.json");
  const manifest = {
    $schema: "https://anthropic.com/claude-code/marketplace.schema.json",
    name: CLAUDE_MARKETPLACE_NAME,
    description: "Local marketplace for arch-insight plugin auto-install.",
    owner: {
      name: "arch-insight"
    },
    plugins: [
      {
        name: "arch-insight",
        description: "Analyze repositories as design systems.",
        source: "./"
      }
    ]
  };

  await fs.mkdir(marketplaceDir, { recursive: true });
  await fs.writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  );
}

async function runClaude(args, { cwd, env }) {
  try {
    await execFileAsync("claude", args, {
      cwd,
      env: {
        ...process.env,
        ...env
      }
    });
  } catch (error) {
    const stderr = String(error?.stderr ?? "").trim();
    const stdout = String(error?.stdout ?? "").trim();
    const details = [stderr, stdout].filter(Boolean).join("\n");
    throw new Error(`Claude plugin registration failed for "${args.join(" ")}"${details ? `:\n${details}` : ""}`);
  }
}
