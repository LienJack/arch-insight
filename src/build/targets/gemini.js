export function buildGeminiBundle(source) {
  const manifest = {
    name: source.manifest.name,
    version: source.manifest.version,
    description: source.manifest.description,
    skills: {
      directory: "./skills"
    },
    agents: {
      directory: "./agents"
    }
  };

  return {
    platform: "gemini",
    files: [
      {
        path: "gemini-extension.json",
        content: JSON.stringify(manifest, null, 2) + "\n"
      },
      {
        path: "GEMINI.md",
        content: source.runnerContent
      },
      ...source.skillEntries.map((entry) => ({
        path: `skills/${entry.relativePath}`,
        content: entry.content
      }))
    ]
  };
}
