export function buildReleaseManifest({ version, baseUrl, bundles }) {
  return {
    name: "arch-insight",
    version,
    generatedAt: new Date().toISOString(),
    baseUrl,
    bundles
  };
}
