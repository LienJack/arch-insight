export function buildCursorBundle(source) {
  const manifest = {
    name: source.manifest.name,
    version: source.manifest.version,
    description: source.manifest.description,
    author: source.manifest.author,
    homepage: source.manifest.homepage,
    repository: source.manifest.repository,
    license: source.manifest.license,
    keywords: source.manifest.keywords ?? [],
    skills: source.manifest.skills ?? "./skills"
  };

  return {
    platform: "cursor",
    files: [
      {
        path: ".cursor-plugin/plugin.json",
        content: JSON.stringify(manifest, null, 2) + "\n"
      },
      ...source.skillEntries.map((entry) => ({
        path: `skills/${entry.relativePath}`,
        content: entry.content
      }))
    ]
  };
}
