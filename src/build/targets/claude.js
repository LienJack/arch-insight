export function buildClaudeBundle(source) {
  return {
    platform: "claude",
    files: [
      {
        path: ".claude-plugin/plugin.json",
        content: JSON.stringify(source.manifest, null, 2) + "\n"
      },
      ...source.skillEntries.map((entry) => ({
        path: `skills/${entry.relativePath}`,
        content: entry.content
      }))
    ]
  };
}
