import { once } from "node:events";

export async function readStdinList(stdin) {
  if (stdin.isTTY) {
    return [];
  }

  const chunks = [];
  stdin.setEncoding("utf8");

  stdin.on("data", (chunk) => {
    chunks.push(chunk);
  });

  await once(stdin, "end");

  return chunks
    .join("")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
