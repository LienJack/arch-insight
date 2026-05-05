import { gzipSync } from "node:zlib";

export function gzipContent(text) {
  return gzipSync(Buffer.from(text, "utf8"));
}
