#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/outputs"
OUTPUT_FILE="$OUTPUT_DIR/repo-context.xml"
MODE="${1:-lean}"

run_repomix() {
  if command -v repomix >/dev/null 2>&1; then
    repomix "$@"
  else
    npx repomix@latest "$@"
  fi
}

mkdir -p "$OUTPUT_DIR"

case "$MODE" in
  lean)
    printf "README.md\nRUNNER.md\nprompts/01_repo_intake.md\n" \
      | run_repomix --stdin -o "$OUTPUT_FILE"
    ;;
  full)
    run_repomix \
      --include "prompts/**/*,templates/**/*" \
      --split-output 1mb \
      --compress \
      -o "$OUTPUT_FILE"
    ;;
  *)
    cat <<'EOF'
Usage:
  ./scripts/build-repomix-context.sh [lean|full]

Modes:
  lean  Build a small reusable context pack from the core entry files.
  full  Build a broader context pack from prompts and templates.
EOF
    exit 1
    ;;
esac

printf 'Wrote %s\n' "$OUTPUT_FILE"
