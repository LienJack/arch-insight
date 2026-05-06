#!/usr/bin/env node

import { runCli } from "../src/cli/run.js";

const platformFromEnv = process.env.ARCH_INSIGHT_PLATFORM;
const releaseBaseUrlFromEnv = process.env.ARCH_INSIGHT_RELEASE_BASE_URL;
const rawArgs = process.argv.slice(2);
let platformFromPositional = "";

if (rawArgs.length > 0 && !rawArgs[0].startsWith("--") && isPlatform(rawArgs[0])) {
  platformFromPositional = rawArgs.shift();
}

const argv = ["install-release", ...rawArgs];

if (platformFromPositional && !hasFlag(argv, "--platform")) {
  argv.push("--platform", platformFromPositional);
}

if (platformFromEnv && !hasFlag(argv, "--platform")) {
  argv.push("--platform", platformFromEnv);
}

if (releaseBaseUrlFromEnv && !hasFlag(argv, "--release-base-url")) {
  argv.push("--release-base-url", releaseBaseUrlFromEnv);
}

const exitCode = await runCli(argv, {
  cwd: process.cwd(),
  stdout: process.stdout,
  stderr: process.stderr,
  env: process.env
});

process.exitCode = exitCode;

function hasFlag(argv, flagName) {
  return argv.some((token) => token === flagName || token.startsWith(`${flagName}=`));
}

function isPlatform(value) {
  return value === "claude"
    || value === "codex"
    || value === "gemini"
    || value === "opencode"
    || value === "pi"
    || value === "kiro"
    || value === "cursor";
}
