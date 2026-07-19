#!/usr/bin/env bash
# Remove everything scripts/install.sh placed under ~/.local.
set -euo pipefail

APP_ID="com.kamsiob.bearings"
OPT_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/bearings-app"
BIN="$HOME/.local/bin/bearings"
DESKTOP="${XDG_DATA_HOME:-$HOME/.local/share}/applications/${APP_ID}.desktop"
ICON_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor"

rm -rf "$OPT_DIR"
rm -f "$BIN" "$DESKTOP"
for s in 16 32 48 64 128 256 512; do rm -f "$ICON_ROOT/${s}x${s}/apps/${APP_ID}.png"; done
rm -f "$ICON_ROOT/scalable/apps/${APP_ID}.svg"

command -v update-desktop-database >/dev/null && update-desktop-database "$(dirname "$DESKTOP")" || true
command -v kbuildsycoca6 >/dev/null && kbuildsycoca6 --noincremental >/dev/null 2>&1 || true

echo "Uninstalled Bearings from ~/.local (user data in ~/.config/bearings kept; delete it to fully reset)."
