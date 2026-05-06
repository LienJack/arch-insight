export function buildPiBundle(source) {
  const manifest = {
    name: source.manifest.name,
    version: source.manifest.version,
    description: source.manifest.description,
    skills: {
      directory: "./skills"
    }
  };

  return {
    platform: "pi",
    files: [
      {
        path: "pi-plugin.json",
        content: JSON.stringify(manifest, null, 2) + "\n"
      },
      ...source.skillEntries.map((entry) => ({
        path: `skills/${entry.relativePath}`,
        content: entry.content
      }))
    ]
  };
}
