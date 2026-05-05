#!/usr/bin/env bash
set -euo pipefail

# One-click installer for Codex users.
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/LienJack/arch-insight/main/scripts/install-codex-skill.sh | bash
#
# Optional environment overrides:
#   REPO_OWNER=YourOrg
#   REPO_NAME=arch-insight
#   REF=main
#   SKILL_NAME=arch-insight
#   DEST_DIR="$HOME/.codex/skills"

REPO_OWNER="${REPO_OWNER:-LienJack}"
REPO_NAME="${REPO_NAME:-arch-insight}"
REF="${REF:-main}"
SKILL_NAME="${SKILL_NAME:-arch-insight}"
DEST_DIR="${DEST_DIR:-$HOME/.codex/skills}"
DEST_PATH="${DEST_DIR}/${SKILL_NAME}"
SKILL_SUBDIR="${SKILL_SUBDIR:-.}"

ARCHIVE_URL="https://codeload.github.com/${REPO_OWNER}/${REPO_NAME}/tar.gz/${REF}"

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

echo "Installing ${SKILL_NAME} into ${DEST_PATH} ..."
echo "Source: ${REPO_OWNER}/${REPO_NAME}@${REF}"

curl -fsSL "$ARCHIVE_URL" -o "${tmp_dir}/repo.tar.gz"
tar -xzf "${tmp_dir}/repo.tar.gz" -C "${tmp_dir}"

repo_path="$(find "${tmp_dir}" -maxdepth 1 -type d -name "${REPO_NAME}-*" | head -n 1)"
if [[ -z "${repo_path}" ]]; then
  echo "Failed to locate extracted repository directory." >&2
  exit 1
fi

src_path="${repo_path}/${SKILL_SUBDIR}"
if [[ ! -d "${src_path}" ]]; then
  echo "Skill subdirectory not found: ${SKILL_SUBDIR}" >&2
  exit 1
fi

if [[ ! -f "${src_path}/SKILL.md" ]]; then
  echo "SKILL.md not found under ${SKILL_SUBDIR}. Refusing to install incomplete skill." >&2
  exit 1
fi

mkdir -p "${DEST_DIR}"
rm -rf "${DEST_PATH}"
mkdir -p "${DEST_PATH}"

rsync -a \
  --exclude ".git" \
  --exclude ".github" \
  --exclude "node_modules" \
  --exclude ".DS_Store" \
  "${src_path}/" "${DEST_PATH}/"

echo
echo "Done."
echo "Installed skill path: ${DEST_PATH}"
echo "Next step: restart Codex to load the new skill."
