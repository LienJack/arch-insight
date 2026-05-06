#!/usr/bin/env bash
set -euo pipefail

PLATFORM="${ARCH_INSIGHT_PLATFORM:-${1:-}}"
RELEASE_BASE_URL="${ARCH_INSIGHT_RELEASE_BASE_URL:-}"

if [[ -z "${PLATFORM}" ]]; then
  echo "Usage: ARCH_INSIGHT_PLATFORM=claude|codex|gemini [ARCH_INSIGHT_RELEASE_BASE_URL=<url>] bash scripts/install.sh" >&2
  exit 1
fi

case "${PLATFORM}" in
  claude|codex|gemini) ;;
  *)
    echo "Unsupported platform: ${PLATFORM}" >&2
    exit 1
    ;;
esac

if [[ -z "${RELEASE_BASE_URL}" ]]; then
  REPO_OWNER="${REPO_OWNER:-LienJack}"
  REPO_NAME="${REPO_NAME:-arch-insight}"
  REF="${REF:-main}"
  RELEASE_BASE_URL="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REF}/dist/release"
fi

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "${tmp_dir}"
}
trap cleanup EXIT

fetch() {
  local url="$1"
  local output="$2"
  if [[ "${url}" == file://* ]]; then
    cp "${url#file://}" "${output}"
  else
    curl -fsSL "${url}" -o "${output}"
  fi
}

MANIFEST_URL="${RELEASE_BASE_URL}/install-manifest.json"
MANIFEST_PATH="${tmp_dir}/install-manifest.json"
fetch "${MANIFEST_URL}" "${MANIFEST_PATH}"

TARBALL_NAME="$(python3 - "${MANIFEST_PATH}" "${PLATFORM}" <<'PY'
import json, sys
manifest_path, platform = sys.argv[1], sys.argv[2]
with open(manifest_path, "r", encoding="utf-8") as handle:
    manifest = json.load(handle)
for bundle in manifest["bundles"]:
    if bundle["platform"] == platform:
        print(bundle["tarball"])
        break
else:
    raise SystemExit(f"No tarball declared for platform: {platform}")
PY
)"

TARBALL_URL="${RELEASE_BASE_URL}/${TARBALL_NAME}"
TARBALL_PATH="${tmp_dir}/${TARBALL_NAME}"
fetch "${TARBALL_URL}" "${TARBALL_PATH}"

extract_dir="${tmp_dir}/bundle"
mkdir -p "${extract_dir}"
tar -xzf "${TARBALL_PATH}" -C "${extract_dir}"

case "${PLATFORM}" in
  claude)
    install_dir="${HOME}/.claude/plugins/local/arch-insight"
    rm -rf "${install_dir}"
    mkdir -p "$(dirname "${install_dir}")"
    cp -R "${extract_dir}/claude" "${install_dir}"
    test -f "${install_dir}/.claude-plugin/plugin.json"
    ;;
  codex)
    skill_dir="${HOME}/.codex/skills/arch-insight"
    rm -rf "${skill_dir}"
    mkdir -p "${skill_dir}"
    cp -R "${extract_dir}/codex/skills/arch-insight/." "${skill_dir}/"
    test -f "${skill_dir}/SKILL.md"
    test -f "${skill_dir}/references/RUNNER.md"
    ;;
  gemini)
    skill_dir="${HOME}/.gemini/skills/arch-insight"
    rm -rf "${skill_dir}"
    mkdir -p "$(dirname "${skill_dir}")"
    cp -R "${extract_dir}/gemini/skills/arch-insight" "${skill_dir}"
    cp "${extract_dir}/gemini/skills/arch-insight/references/RUNNER.md" "${skill_dir}/RUNNER.md"
    test -f "${skill_dir}/SKILL.md"
    test -f "${skill_dir}/RUNNER.md"
    ;;
esac

echo "Installed arch-insight for ${PLATFORM}."
