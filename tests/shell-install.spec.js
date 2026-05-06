import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { buildReleaseArtifacts } from "../src/release/build-release-artifacts.js";

const execFileAsync = promisify(execFile);
const SOURCE_DIR = path.resolve(".agents");

test("install.mjs 链路不依赖 npm 也能完成安装", async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "arch-insight-shell-"));
  const releaseDir = path.join(workspace, "release");
  const homeDir = path.join(workspace, "home");
  await fs.mkdir(homeDir, { recursive: true });

  await buildReleaseArtifacts({
    sourceDir: SOURCE_DIR,
    outputDir: releaseDir,
    baseUrl: `file://${releaseDir}`
  });

  await execFileAsync(process.execPath, [path.resolve("scripts/install.mjs")], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOME: homeDir,
      ARCH_INSIGHT_PLATFORM: "codex",
      ARCH_INSIGHT_RELEASE_BASE_URL: `file://${releaseDir}`
    }
  });

  const skillFile = await fs.readFile(
    path.join(homeDir, ".codex", "skills", "arch-insight", "SKILL.md"),
    "utf8"
  );
  assert.match(skillFile, /# arch-insight/);

  const releaseIndex = JSON.parse(
    await fs.readFile(path.join(releaseDir, "bundles", "codex", "bundle-index.json"), "utf8")
  );
  assert.ok(releaseIndex.files.some((file) => file.path === "skills/arch-insight/SKILL.md"));
});
