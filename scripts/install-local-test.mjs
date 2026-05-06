#!/usr/bin/env node

import path from "node:path";
import { pathToFileURL } from "node:url";

import { runCli } from "../src/cli/run.js";
import { buildReleaseArtifacts } from "../src/release/build-release-artifacts.js";

const platformFromEnv = process.env.ARCH_INSIGHT_PLATFORM;
const rawArgs = process.argv.slice(2);
let platformFromPositional = "";

if (rawArgs.length > 0 && !rawArgs[0].startsWith("--") && isPlatform(rawArgs[0])) {
  platformFromPositional = rawArgs.shift();
}

const cwd = process.cwd();
const sourceDir = path.resolve(cwd, process.env.ARCH_INSIGHT_SOURCE_DIR ?? ".agents");
const releaseDir = path.resolve(cwd, process.env.ARCH_INSIGHT_LOCAL_RELEASE_DIR ?? "dist/local-release");
const fallbackReleaseBaseUrl = stripTrailingSlash(pathToFileURL(releaseDir).href);
const releaseBaseUrlFromEnv = process.env.ARCH_INSIGHT_RELEASE_BASE_URL;

await buildReleaseArtifacts({
  sourceDir,
  outputDir: releaseDir,
  baseUrl: releaseBaseUrlFromEnv ?? fallbackReleaseBaseUrl
});

const argv = ["install-release", ...rawArgs];

if (platformFromPositional && !hasFlag(argv, "--platform")) {
  argv.push("--platform", platformFromPositional);
}

if (platformFromEnv && !hasFlag(argv, "--platform")) {
  argv.push("--platform", platformFromEnv);
}

if (!hasFlag(argv, "--release-base-url")) {
  argv.push("--release-base-url", releaseBaseUrlFromEnv ?? fallbackReleaseBaseUrl);
}

const exitCode = await runCli(argv, {
  cwd,
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

function stripTrailingSlash(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
