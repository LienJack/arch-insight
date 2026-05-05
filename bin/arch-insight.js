#!/usr/bin/env node

import { runCli } from "../src/cli/run.js";

const exitCode = await runCli(process.argv.slice(2), {
  cwd: process.cwd(),
  stdout: process.stdout,
  stderr: process.stderr,
  env: process.env
});

process.exitCode = exitCode;
