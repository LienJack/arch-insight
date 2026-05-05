#!/usr/bin/env bash
set -euo pipefail

echo "This compatibility installer now delegates to scripts/install.sh for Codex."
ARCH_INSIGHT_PLATFORM="codex" bash <(curl -fsSL "https://raw.githubusercontent.com/${REPO_OWNER:-LienJack}/${REPO_NAME:-arch-insight}/${REF:-main}/scripts/install.sh")
