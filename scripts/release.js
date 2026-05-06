#!/usr/bin/env node

import path from "node:path";

import { buildReleaseArtifacts } from "../src/release/build-release-artifacts.js";

const cwd = process.cwd();
const sourceDir = path.resolve(cwd, process.env.ARCH_INSIGHT_SOURCE_DIR ?? ".agents");
const outputDir = path.resolve(cwd, process.env.ARCH_INSIGHT_RELEASE_OUTPUT_DIR ?? "dist/release");
const baseUrl = process.env.ARCH_INSIGHT_RELEASE_BASE_URL ?? "";

const manifest = await buildReleaseArtifacts({
  sourceDir,
  outputDir,
  baseUrl
});

process.stdout.write(`${JSON.stringify({ command: "release:prepare", outputDir, manifest }, null, 2)}\n`);
