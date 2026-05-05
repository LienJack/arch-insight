import path from "node:path";
import { parseCliArgs, getHelpText } from "./args.js";
import { discoverFiles } from "../core/discover-files.js";
import { applyFilters } from "../core/apply-filters.js";
import { buildTokenTree, formatTokenTreeReport } from "../core/token-tree.js";
import { buildPackage } from "../core/build-package.js";
import { splitPackageOutput } from "../core/split-output.js";
import { gzipContent } from "../core/compress-output.js";
import { readStdinList } from "../io/read-stdin-list.js";
import { writeSingleOutput, writeSplitOutputs } from "../io/write-output.js";

export async function runCli(parsedArgs, runtime) {
  const rootPath = path.resolve(runtime.cwd, parsedArgs.input);
  const stdinFiles = parsedArgs.useStdin ? await readStdinList(runtime.stdin) : [];

  const discoveredFiles = await discoverFiles(rootPath);

  const { files, warnings } = applyFilters(discoveredFiles, {
    includePatterns: parsedArgs.include,
    ignorePatterns: parsedArgs.ignore,
    stdinFiles
  });

  for (const warning of warnings) {
    runtime.stderr.write(`warning: ${warning}\n`);
  }

  if (files.length === 0) {
    throw new Error("No files selected after applying filters.");
  }

  if (parsedArgs.mode === "token-count-tree") {
    const tokenTree = await buildTokenTree({
      rootPath,
      files,
      tokenizerName: parsedArgs.tokenizer
    });

    runtime.stdout.write(formatTokenTreeReport(tokenTree));
    return { mode: "token-count-tree", filesProcessed: files.length, outputs: [] };
  }

  const pack = await buildPackage({ rootPath, files });

  let outputs;
  if (parsedArgs.split) {
    const parts = splitPackageOutput({
      header: pack.header,
      sections: pack.sections,
      maxChars: parsedArgs.split
    });

    outputs = await writeSplitOutputs({
      outputPath: parsedArgs.output,
      parts,
      compress: parsedArgs.compress,
      gzipContent
    });
  } else {
    outputs = await writeSingleOutput({
      outputPath: parsedArgs.output,
      content: pack.content,
      compress: parsedArgs.compress,
      gzipContent
    });
  }

  return { mode: "package", filesProcessed: files.length, outputs };
}

export async function executeFromArgv(argv, runtime) {
  const parsed = parseCliArgs(argv);

  if (!parsed.ok) {
    runtime.stderr.write(`${parsed.error}\n\n`);
    runtime.stderr.write(`${getHelpText()}\n`);
    return parsed.code ?? 2;
  }

  if (parsed.value.help) {
    runtime.stdout.write(`${getHelpText()}\n`);
    return 0;
  }

  try {
    const result = await runCli(parsed.value, runtime);

    if (result.mode === "package") {
      runtime.stdout.write(`Packed ${result.filesProcessed} files.\n`);
      for (const output of result.outputs) {
        runtime.stdout.write(`- ${output}\n`);
      }
    }

    return 0;
  } catch (error) {
    runtime.stderr.write(`Error: ${error.message}\n`);
    return 1;
  }
}
