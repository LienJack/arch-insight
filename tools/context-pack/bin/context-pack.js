#!/usr/bin/env node

import { executeFromArgv } from "../src/cli/run.js";

const exitCode = await executeFromArgv(process.argv.slice(2), {
  cwd: process.cwd(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr
});

process.exit(exitCode);
