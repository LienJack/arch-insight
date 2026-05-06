import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { cancel, confirm, intro, isCancel, log, multiselect, outro, spinner } from "@clack/prompts";

import { createProgram } from "./args.js";
import { buildBundles } from "../build/build-bundles.js";
import { installBundle } from "../install/install-bundle.js";
import { buildReleaseArtifacts } from "../release/build-release-artifacts.js";
import { downloadReleaseBundle } from "../release/download-release-bundle.js";

export async function runCli(argv, context) {
  try {
    const parsed = parseCommand(argv);

    const cwd = context.cwd;
    const sourceDir = path.resolve(cwd, parsed.options.sourceDir ?? ".agents");
    const outputDir = path.resolve(cwd, parsed.options.outputDir ?? "dist");
    const bundleDir = path.resolve(cwd, parsed.options.bundleDir ?? "dist");

    switch (parsed.command) {
      case "help": {
        writeResult(context.stdout, parsed.options.json, {
          help: createProgram().helpInformation()
        });
        return 0;
      }
      case "build": {
        const result = await buildBundles({
          sourceDir,
          outputDir,
          platform: parsed.options.platforms?.[0]
        });

        writeResult(context.stdout, parsed.options.json, {
          command: "build",
          bundles: result
        });
        return 0;
      }
      case "install": {
        const platforms = await resolveTargetPlatforms(parsed.options.platforms, parsed.options.json);
        if (platforms.length === 0) {
          return 0;
        }

        if (parsed.options.targetDir && platforms.length > 1) {
          throw new Error("--target-dir requires exactly one --platform.");
        }

        const results = [];

        for (const platform of platforms) {
          const resolvedBundleDir = await ensureBundleDir({
            bundleDir,
            sourceDir,
            platform
          });

          const result = await installBundle({
            bundleDir: resolvedBundleDir,
            platform,
            targetDir: parsed.options.targetDir,
            cwd,
            env: context.env,
            registerClaudePlugin: true
          });
          results.push(result);
        }

        writeResult(context.stdout, parsed.options.json, {
          command: "install",
          installed: results,
          platformCount: results.length
        });
        return 0;
      }
      case "install-release":
      case "update":
      case "upgrade": {
        const platforms = await resolveTargetPlatforms(parsed.options.platforms, parsed.options.json);
        if (platforms.length === 0) {
          return 0;
        }

        if (parsed.options.targetDir && platforms.length > 1) {
          throw new Error("--target-dir requires exactly one --platform.");
        }

        const releaseSource = await resolveReleaseSource({
          explicitReleaseBaseUrl: parsed.options.releaseBaseUrl,
          tempDir: parsed.options.tempDir
        });
        const results = [];
        let manifestVersion = "";

        for (const platform of platforms) {
          const download = await downloadReleaseBundle({
            platform,
            releaseBaseUrl: releaseSource.releaseBaseUrl,
            tempDir: parsed.options.tempDir,
            cacheDir: parsed.options.cacheDir
          });

          manifestVersion = download.manifest.version;
          const result = await installBundle({
            bundleDir: download.bundleDir,
            platform,
            targetDir: parsed.options.targetDir,
            cwd,
            env: context.env,
            registerClaudePlugin: true
          });

          results.push({
            ...result,
            fromCache: download.fromCache,
            cacheReason: download.cacheReason,
            bundlePath: download.downloadedPlatformDir
          });
        }

        writeResult(context.stdout, parsed.options.json, {
          command: parsed.command,
          releaseBaseUrl: releaseSource.releaseBaseUrl,
          manifestVersion,
          installed: results,
          platformCount: results.length
        });
        return 0;
      }
      case "release": {
        const result = await buildReleaseArtifacts({
          sourceDir,
          outputDir,
          baseUrl: parsed.options.baseUrl ?? ""
        });

        writeResult(context.stdout, parsed.options.json, {
          command: "release",
          manifest: result
        });
        return 0;
      }
      default:
        throw new Error(`Unsupported command: ${parsed.command}`);
    }
  } catch (error) {
    context.stderr.write(`${error.message}\n`);
    return 1;
  }
}

function parseCommand(argv) {
  if (argv.length === 0 || argv[0] === "help" || argv[0] === "--help" || argv[0] === "-h") {
    return {
      command: "help",
      options: {
        json: argv.includes("--json")
      }
    };
  }

  const program = createProgram();
  program.configureOutput({
    writeOut: () => {},
    writeErr: () => {}
  });
  program.exitOverride();

  program.parse(argv, { from: "user" });

  return program.__archInsight ?? null;
}

async function resolveTargetPlatforms(existingPlatforms, asJson) {
  if (existingPlatforms && existingPlatforms.length > 0) {
    return existingPlatforms;
  }

  if (asJson) {
    throw new Error("When using --json, at least one --platform must be provided.");
  }

  intro("arch-insight installer");
  log.info("Use Space to toggle targets, then press Enter to submit.");
  const selected = await multiselect({
    message: "Select installation targets (Space to toggle, Enter to continue)",
    options: [
      { value: "codex", label: "Codex", hint: "~/.codex/skills/arch-insight" },
      { value: "claude", label: "Claude", hint: "~/.claude/plugins/local/arch-insight" },
      { value: "gemini", label: "Gemini", hint: "~/.gemini/skills/arch-insight" },
      { value: "opencode", label: "OpenCode", hint: "~/.config/opencode/skills/arch-insight" },
      { value: "pi", label: "Pi", hint: "~/.pi/agent/skills/arch-insight" },
      { value: "kiro", label: "Kiro", hint: "~/.kiro/skills/arch-insight" },
      { value: "cursor", label: "Cursor", hint: "~/.cursor/plugins/local/arch-insight" }
    ],
    required: true,
    initialValues: ["codex"]
  });

  if (isCancel(selected)) {
    cancel("Installation cancelled.");
    return [];
  }

  const shouldInstall = await confirm({
    message: `Install now to: ${selected.join(", ")} ?`,
    initialValue: true
  });
  if (isCancel(shouldInstall) || !shouldInstall) {
    cancel("Installation cancelled. No changes were made.");
    return [];
  }

  const task = spinner();
  task.start("Preparing installation...");
  task.stop(`Selected targets: ${selected.join(", ")}`);
  log.info("You can also pass repeated --platform flags to skip interactive mode.");
  outro("Starting installation");

  return selected;
}

async function ensureBundleDir({ bundleDir, sourceDir, platform }) {
  try {
    return await assertBundleDir(bundleDir, platform);
  } catch {
    await buildBundles({
      sourceDir,
      outputDir: bundleDir,
      platform
    });
    return assertBundleDir(bundleDir, platform);
  }
}

async function assertBundleDir(bundleDir, platform) {
  const bundleRoot = path.join(bundleDir, platform);
  await fs.access(bundleRoot);
  return bundleDir;
}

async function resolveReleaseSource({ explicitReleaseBaseUrl, tempDir }) {
  if (explicitReleaseBaseUrl) {
    return { releaseBaseUrl: explicitReleaseBaseUrl };
  }

  const sourceDir = bundledSourceDir();
  const releaseDir = tempDir
    ? path.resolve(tempDir, "release")
    : await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-release-"));

  const releaseBaseUrl = stripTrailingSlash(pathToFileURL(releaseDir).href);
  await buildReleaseArtifacts({
    sourceDir,
    outputDir: releaseDir,
    baseUrl: releaseBaseUrl
  });

  return { releaseBaseUrl };
}

function bundledSourceDir() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", ".agents");
}

function stripTrailingSlash(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function writeResult(stream, asJson, payload) {
  if (asJson) {
    stream.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  if (payload.help) {
    stream.write(`${payload.help}\n`);
    return;
  }

  stream.write(`${JSON.stringify(payload, null, 2)}\n`);
}
