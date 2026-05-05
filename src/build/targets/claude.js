export function buildClaudeBundle(source) {
  return {
    platform: "claude",
    files: [
      {
        path: ".claude-plugin/plugin.json",
        content: JSON.stringify(source.manifest, null, 2) + "\n"
      },
      {
        path: "RUNNER.md",
        content: source.runnerContent
      },
      ...source.skillEntries.map((entry) => ({
        path: `skills/${entry.relativePath}`,
        content: entry.content
      })),
      ...source.promptEntries.map((entry) => ({
        path: `prompts/${entry.relativePath}`,
        content: entry.content
      })),
      ...source.templateEntries.map((entry) => ({
        path: `templates/${entry.relativePath}`,
        content: entry.content
      }))
    ]
  };
}
