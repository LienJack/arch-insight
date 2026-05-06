import { Command } from "commander";

const SUPPORTED_PLATFORMS = ["claude", "codex", "gemini", "opencode", "pi", "kiro", "cursor"];

export function createProgram() {
  const program = new Command();

  program
    .name("arch-insight")
    .description("Multi-platform distribution tooling for the arch-insight skill.")
    .showHelpAfterError()
    .addHelpText(
      "after",
      `\nExamples:\n  $ arch-insight install-release\n  $ arch-insight install-release --platform codex --platform claude\n  $ arch-insight install --platform gemini --source-dir .agents\n  $ arch-insight install --platform opencode --platform pi --platform kiro --platform cursor\n`
    )
    .option("--json", "Print JSON output");

  program
    .command("build")
    .description("Build installable bundles from the canonical Claude plugin source.")
    .option("--platform <name>", "Target platform: claude, codex, gemini, opencode, pi, kiro, cursor")
    .option("--output-dir <path>", "Directory for built artifacts")
    .option("--source-dir <path>", "Override canonical plugin source path")
    .action((options, command) => {
      commandResult(command, "build", options);
    });

  program
    .command("install")
    .description("Install into supported platform homes. If no --platform is passed, enter interactive mode.")
    .option("--platform <name>", "Target platform (repeatable): claude, codex, gemini, opencode, pi, kiro, cursor", appendPlatform, [])
    .option("--bundle-dir <path>", "Directory containing previously built bundles")
    .option("--target-dir <path>", "Override the install destination; only valid for a single platform")
    .option("--source-dir <path>", "Override canonical plugin source path")
    .action((options, command) => {
      commandResult(command, "install", options);
    });

  program
    .command("install-release")
    .description("Install from release artifacts. If no --platform is passed, enter interactive mode.")
    .option("--platform <name>", "Target platform (repeatable): claude, codex, gemini, opencode, pi, kiro, cursor", appendPlatform, [])
    .option("--release-base-url <url>", "Public release directory URL that contains install-manifest.json")
    .option("--target-dir <path>", "Override the install destination; only valid for a single platform")
    .option("--temp-dir <path>", "Working directory for downloaded release bundles")
    .action((options, command) => {
      commandResult(command, "install-release", options);
    });

  program
    .command("update")
    .description("Alias of install-release.")
    .option("--platform <name>", "Target platform (repeatable): claude, codex, gemini, opencode, pi, kiro, cursor", appendPlatform, [])
    .option("--release-base-url <url>", "Public release directory URL that contains install-manifest.json")
    .option("--target-dir <path>", "Override the install destination; only valid for a single platform")
    .option("--temp-dir <path>", "Working directory for downloaded release bundles")
    .action((options, command) => {
      commandResult(command, "update", options);
    });

  program
    .command("upgrade")
    .description("Alias of update.")
    .option("--platform <name>", "Target platform (repeatable): claude, codex, gemini, opencode, pi, kiro, cursor", appendPlatform, [])
    .option("--release-base-url <url>", "Public release directory URL that contains install-manifest.json")
    .option("--target-dir <path>", "Override the install destination; only valid for a single platform")
    .option("--temp-dir <path>", "Working directory for downloaded release bundles")
    .action((options, command) => {
      commandResult(command, "upgrade", options);
    });

  program
    .command("release")
    .description("Build release bundles plus an install manifest for distribution.")
    .option("--output-dir <path>", "Directory for built artifacts")
    .option("--source-dir <path>", "Override canonical plugin source path")
    .option("--base-url <url>", "Public base URL used in release manifest")
    .action((options, command) => {
      commandResult(command, "release", options);
    });

  return program;
}

export function parseArgs(argv) {
  const helpText = formatHelp();
  if (argv.length === 0 || argv[0] === "help" || argv[0] === "--help" || argv[0] === "-h") {
    return {
      command: "help",
      options: {
        json: argv.includes("--json")
      },
      positionals: [],
      helpText
    };
  }

  const program = createProgram();
  program.configureOutput({
    writeOut: () => {},
    writeErr: () => {}
  });
  program.exitOverride();
  program.parse(argv, { from: "user" });

  const parsed = program.__archInsight;
  if (!parsed) {
    throw new Error("No command selected.");
  }

  return {
    command: parsed.command,
    options: parsed.options,
    positionals: [],
    helpText
  };
}

export function formatHelp() {
  return createProgram().helpInformation();
}

function commandResult(command, name, options) {
  const globalOptions = command.optsWithGlobals();
  command.parent.__archInsight = {
    command: name,
    options: {
      ...normalizeOptions(options),
      ...(globalOptions.json ? { json: true } : {})
    }
  };
}

function normalizeOptions(options) {
  const normalized = { ...options };
  if (typeof normalized.platform === "string") {
    normalized.platforms = [assertSupportedPlatform(normalized.platform)];
    delete normalized.platform;
  }

  if (Array.isArray(normalized.platform)) {
    normalized.platforms = dedupePlatforms(normalized.platform.map(assertSupportedPlatform));
    delete normalized.platform;
  }
  return normalized;
}

function appendPlatform(value, previous = []) {
  return [...previous, value];
}

function assertSupportedPlatform(value) {
  if (!SUPPORTED_PLATFORMS.includes(value)) {
    throw new Error(`Unsupported platform: ${value}`);
  }
  return value;
}

function dedupePlatforms(values) {
  return [...new Set(values)];
}
