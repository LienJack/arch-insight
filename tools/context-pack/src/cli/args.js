import { parseArgs } from "node:util";

export const DEFAULT_TOKENIZER = "cl100k_base";
export const DEFAULT_OUTPUT_FILE = "context-pack.md";

const DESCRIPTION =
  "Context packaging capability for local repositories: filter files, inspect token tree, and produce AI-friendly output.";

export function getHelpText() {
  return [
    "context-pack - local repository context packaging",
    "",
    DESCRIPTION,
    "",
    "Usage:",
    "  context-pack [options]",
    "",
    "Options:",
    "  -i, --input <path>         Root path to scan (default: .)",
    "      --include <glob>       Include pattern (repeatable or comma-separated)",
    "      --ignore <glob>        Ignore pattern (repeatable or comma-separated)",
    "      --stdin                Read file list from stdin (one path per line)",
    "      --token-count-tree     Print token distribution tree only",
    "      --tokenizer <name>     Tokenizer baseline (default: cl100k_base)",
    "      --compress             Write gzip-compressed output",
    "      --split <max-chars>    Split output by character budget per part",
    "  -o, --output <path>        Output file path (default: context-pack.md)",
    "  -h, --help                 Show this help",
    "",
    "Examples:",
    "  context-pack --include \"src/**/*,README.md\"",
    "  context-pack --stdin --token-count-tree < selected-files.txt",
    "  context-pack --split 120000 --compress -o output/context-pack.md"
  ].join("\n");
}

function parsePatternList(values) {
  const output = [];
  for (const value of values ?? []) {
    for (const piece of value.split(",")) {
      const trimmed = piece.trim();
      if (trimmed.length > 0) {
        output.push(trimmed);
      }
    }
  }
  return output;
}

export function parseCliArgs(argv) {
  let parsed;

  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: false,
      strict: true,
      options: {
        input: { type: "string", short: "i" },
        include: { type: "string", multiple: true },
        ignore: { type: "string", multiple: true },
        stdin: { type: "boolean", default: false },
        tokenCountTree: { type: "boolean", default: false },
        "token-count-tree": { type: "boolean", default: false },
        tokenizer: { type: "string" },
        compress: { type: "boolean", default: false },
        split: { type: "string" },
        output: { type: "string", short: "o" },
        help: { type: "boolean", short: "h", default: false }
      }
    });
  } catch (error) {
    return {
      ok: false,
      code: 2,
      error: `Argument error: ${error.message}`
    };
  }

  const { values } = parsed;

  if (values.help) {
    return {
      ok: true,
      value: { help: true }
    };
  }

  let split = null;
  if (values.split !== undefined) {
    split = Number.parseInt(values.split, 10);
    if (!Number.isFinite(split) || split <= 0) {
      return {
        ok: false,
        code: 2,
        error: "`--split` must be a positive integer."
      };
    }
  }

  const tokenCountTree = Boolean(values.tokenCountTree || values["token-count-tree"]);

  if (tokenCountTree && (values.compress || split !== null)) {
    return {
      ok: false,
      code: 2,
      error: "`--token-count-tree` cannot be combined with `--compress` or `--split`."
    };
  }

  const tokenizer = values.tokenizer ?? DEFAULT_TOKENIZER;

  return {
    ok: true,
    value: {
      help: false,
      input: values.input ?? ".",
      include: parsePatternList(values.include),
      ignore: parsePatternList(values.ignore),
      useStdin: Boolean(values.stdin),
      mode: tokenCountTree ? "token-count-tree" : "package",
      tokenizer,
      compress: Boolean(values.compress),
      split,
      output: values.output ?? DEFAULT_OUTPUT_FILE
    }
  };
}
