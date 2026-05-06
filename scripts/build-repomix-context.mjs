#!/usr/bin/env node

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "outputs");
const outputFile = path.join(outputDir, "repo-context.xml");
const mode = process.argv[2] ?? "lean";

await fs.mkdir(outputDir, { recursive: true });

if (mode === "lean") {
  const stdin = [
    "README.md",
    ".agents/skills/arch-insight/references/RUNNER.md",
    ".agents/skills/arch-insight/references/prompts/01_repo_intake.md"
  ].join("\n");
  await runRepomix(["--stdin", "-o", outputFile], stdin);
  process.stdout.write(`Wrote ${outputFile}\n`);
  process.exit(0);
}

if (mode === "full") {
  await runRepomix(
    [
      "--include",
      ".agents/skills/arch-insight/references/prompts/**/*,.agents/skills/arch-insight/references/templates/**/*",
      "--split-output",
      "1mb",
      "--compress",
      "-o",
      outputFile
    ],
    ""
  );
  process.stdout.write(`Wrote ${outputFile}\n`);
  process.exit(0);
}

process.stderr.write(`Usage:
  node scripts/build-repomix-context.mjs [lean|full]

Modes:
  lean  Build a small reusable context pack from the core entry files.
  full  Build a broader context pack from prompts and templates.
`);
process.exit(1);

async function runRepomix(args, stdinText) {
  const hasRepomix = await commandExists("repomix");
  const command = hasRepomix ? "repomix" : getNpxCommand();
  const commandArgs = hasRepomix ? args : ["repomix@latest", ...args];

  await spawnAndWait(command, commandArgs, stdinText, rootDir);
}

function getNpxCommand() {
  if (process.platform === "win32") {
    return "npx.cmd";
  }
  return "npx";
}

async function commandExists(command) {
  const probeCommand = process.platform === "win32" ? "where" : "command";
  const probeArgs = process.platform === "win32" ? [command] : ["-v", command];

  try {
    await spawnAndWait(probeCommand, probeArgs, "", process.cwd(), true);
    return true;
  } catch {
    return false;
  }
}

function spawnAndWait(command, args, stdinText, cwd, quiet = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["pipe", "inherit", "inherit"],
      shell: false
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      const hint = quiet ? "" : `\nCommand failed: ${command} ${args.join(" ")}`;
      reject(new Error(`repomix execution failed with exit code ${code}.${hint}`));
    });

    child.stdin.end(stdinText);
  });
}
