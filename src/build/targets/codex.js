export function buildCodexBundle(source) {
  const manifest = {
    name: source.manifest.name,
    version: source.manifest.version,
    description: source.manifest.description,
    author: source.manifest.author,
    homepage: source.manifest.homepage,
    repository: source.manifest.repository,
    license: source.manifest.license,
    keywords: source.manifest.keywords ?? [],
    skills: "./skills/",
    interface: {
      displayName: source.manifest.display_name ?? "arch-insight",
      shortDescription: source.manifest.description,
      longDescription:
        "Analyze repositories as design systems: extract philosophy, abstractions, flows, tradeoffs, and borrowable patterns.",
      developerName: source.manifest.author?.name ?? "arch-insight",
      category: "Developer Tools",
      capabilities: ["Read", "Write"],
      defaultPrompt: [
        "Analyze this repository and explain why its architecture looks the way it does"
      ]
    }
  };

  return {
    platform: "codex",
    files: [
      {
        path: ".codex-plugin/plugin.json",
        content: JSON.stringify(manifest, null, 2) + "\n"
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
