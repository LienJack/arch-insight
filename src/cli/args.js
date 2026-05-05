const HELP_TEXT = `arch-insight

Usage:
  arch-insight help
  arch-insight build [--platform claude|codex|gemini] [--output-dir <path>]
  arch-insight install --platform claude|codex|gemini [--bundle-dir <path>] [--target-dir <path>]
  arch-insight release [--output-dir <path>] [--base-url <url>]

Commands:
  build      Build installable bundles from the canonical Claude plugin source.
  install    Install a built bundle into a local Claude, Codex, or Gemini home.
  release    Build release tarballs plus an install manifest for shell distribution.
  help       Show this help text.

Options:
  --platform <name>     Target platform: claude, codex, gemini
  --output-dir <path>   Directory for built artifacts
  --bundle-dir <path>   Directory containing previously built bundles
  --target-dir <path>   Override the platform install destination
  --base-url <url>      Public base URL used in release manifest
  --source-dir <path>   Override canonical plugin source path
  --json                Print JSON output
`;

export function parseArgs(argv) {
  const tokens = [...argv];
  const command = tokens.shift() ?? "help";
  const options = {};
  const positionals = [];

  while (tokens.length > 0) {
    const token = tokens.shift();
    if (!token) {
      continue;
    }

    if (token === "--json") {
      options.json = true;
      continue;
    }

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const [flag, inlineValue] = token.split("=", 2);
    const key = flag.slice(2);
    const nextValue = inlineValue ?? tokens.shift();

    if (!nextValue) {
      throw new Error(`Option ${flag} requires a value.`);
    }

    options[key] = nextValue;
  }

  validateCommand(command, options, positionals);

  return {
    command,
    options,
    positionals,
    helpText: HELP_TEXT
  };
}

function validateCommand(command, options, positionals) {
  const supportedCommands = new Set(["help", "build", "install", "release"]);
  if (!supportedCommands.has(command)) {
    throw new Error(`Unknown command: ${command}`);
  }

  if (positionals.length > 0) {
    throw new Error(`Unexpected positional arguments: ${positionals.join(" ")}`);
  }

  if (command === "install" && !options.platform) {
    throw new Error("install requires --platform.");
  }

  if (command === "build" && options.platform && !isSupportedPlatform(options.platform)) {
    throw new Error(`Unsupported platform: ${options.platform}`);
  }

  if (command === "install" && !isSupportedPlatform(options.platform)) {
    throw new Error(`Unsupported platform: ${options.platform}`);
  }
}

function isSupportedPlatform(value) {
  return ["claude", "codex", "gemini"].includes(value);
}

export function formatHelp() {
  return HELP_TEXT;
}
