import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function ensurePartNumber(value) {
  return String(value).padStart(3, "0");
}

function resolveSplitNames(outputPath, parts, compress) {
  const parsed = path.parse(outputPath);
  const ext = parsed.ext || ".md";
  const baseName = parsed.name || "context-pack";
  const directory = parsed.dir || ".";

  const names = parts.map((part) => {
    const stem = `${baseName}.part-${ensurePartNumber(part.part)}`;
    const fileName = `${stem}${ext}${compress ? ".gz" : ""}`;
    return {
      ...part,
      outputPath: path.join(directory, fileName)
    };
  });

  const indexPath = path.join(directory, `${baseName}.index.json`);

  return { names, indexPath };
}

export async function writeSingleOutput({ outputPath, content, compress, gzipContent }) {
  const resolvedOutputPath = path.resolve(outputPath);
  await mkdir(path.dirname(resolvedOutputPath), { recursive: true });

  if (compress) {
    const finalPath = resolvedOutputPath.endsWith(".gz") ? resolvedOutputPath : `${resolvedOutputPath}.gz`;
    await writeFile(finalPath, gzipContent(content));
    return [finalPath];
  }

  await writeFile(resolvedOutputPath, content, "utf8");
  return [resolvedOutputPath];
}

export async function writeSplitOutputs({ outputPath, parts, compress, gzipContent }) {
  const { names, indexPath } = resolveSplitNames(outputPath, parts, compress);
  const writtenFiles = [];

  for (const part of names) {
    const resolvedPath = path.resolve(part.outputPath);
    await mkdir(path.dirname(resolvedPath), { recursive: true });

    if (compress) {
      await writeFile(resolvedPath, gzipContent(part.content));
    } else {
      await writeFile(resolvedPath, part.content, "utf8");
    }

    writtenFiles.push(resolvedPath);
  }

  const indexPayload = {
    generatedAt: new Date().toISOString(),
    parts: names.map((part) => ({
      part: part.part,
      total: part.total,
      fileCount: part.files.length,
      files: part.files,
      path: path.basename(part.outputPath)
    }))
  };

  const resolvedIndexPath = path.resolve(indexPath);
  await mkdir(path.dirname(resolvedIndexPath), { recursive: true });
  await writeFile(resolvedIndexPath, JSON.stringify(indexPayload, null, 2), "utf8");
  writtenFiles.push(resolvedIndexPath);

  return writtenFiles;
}
