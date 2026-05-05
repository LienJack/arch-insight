import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { buildReleaseArtifacts } from "../src/release/build-release-artifacts.js";

const execFileAsync = promisify(execFile);
const SOURCE_DIR = path.resolve("plugins/arch-insight");

test("shell 链路不依赖 npm 也能完成安装", async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-shell-"));
  const releaseDir = path.join(workspace, "release");
  const homeDir = path.join(workspace, "home");
  await fs.mkdir(homeDir, { recursive: true });

  await buildReleaseArtifacts({
    sourceDir: SOURCE_DIR,
    outputDir: releaseDir,
    baseUrl: `file://${releaseDir}`
  });

  await execFileAsync("bash", [path.resolve("scripts/install.sh")], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOME: homeDir,
      ARCH_INSIGHT_PLATFORM: "codex",
      ARCH_INSIGHT_RELEASE_BASE_URL: `file://${releaseDir}`
    }
  });

  const skillFile = await fs.readFile(
    path.join(homeDir, ".codex", "skills", "arch-insight", "arch-insight", "SKILL.md"),
    "utf8"
  );
  assert.match(skillFile, /# arch-insight/);
});
