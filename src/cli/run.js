import path from "node:path";

import { parseArgs, formatHelp } from "./args.js";
import { buildBundles } from "../build/build-bundles.js";
import { installBundle } from "../install/install-bundle.js";
import { buildReleaseArtifacts } from "../release/build-release-artifacts.js";

export async function runCli(argv, context) {
  try {
    const parsed = parseArgs(argv);
    const cwd = context.cwd;
    const sourceDir = path.resolve(cwd, parsed.options["source-dir"] ?? "plugins/arch-insight");
    const outputDir = path.resolve(cwd, parsed.options["output-dir"] ?? "dist");
    const bundleDir = path.resolve(cwd, parsed.options["bundle-dir"] ?? "dist");

    switch (parsed.command) {
      case "help":
        writeResult(context.stdout, parsed.options.json, {
          help: formatHelp()
        });
        return 0;
      case "build": {
        const result = await buildBundles({
          sourceDir,
          outputDir,
          platform: parsed.options.platform
        });
        writeResult(context.stdout, parsed.options.json, {
          command: "build",
          bundles: result
        });
        return 0;
      }
      case "install": {
        const result = await installBundle({
          bundleDir,
          platform: parsed.options.platform,
          targetDir: parsed.options["target-dir"]
        });
        writeResult(context.stdout, parsed.options.json, {
          command: "install",
          ...result
        });
        return 0;
      }
      case "release": {
        const result = await buildReleaseArtifacts({
          sourceDir,
          outputDir,
          baseUrl: parsed.options["base-url"] ?? ""
        });
        writeResult(context.stdout, parsed.options.json, {
          command: "release",
          manifest: result
        });
        return 0;
      }
      default:
        throw new Error(`Unsupported command: ${parsed.command}`);
    }
  } catch (error) {
    context.stderr.write(`${error.message}\n`);
    return 1;
  }
}

function writeResult(stream, asJson, payload) {
  if (asJson) {
    stream.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  if (payload.help) {
    stream.write(`${payload.help}\n`);
    return;
  }

  stream.write(`${JSON.stringify(payload, null, 2)}\n`);
}
