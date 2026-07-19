#!/usr/bin/env bash
# Install the built Bearings bundle into the user's KDE app menu (no root needed).
# Everything lands under ~/.local, so uninstalling is a clean delete
# (scripts/uninstall.sh). Run scripts/build.sh first.
set -euo pipefail
cd "$(dirname "$0")/.."

APP_ID="com.kamsiob.bearings"
BUNDLE="dist/bearings"
OPT_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/bearings-app"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
ICON_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor"

if [ ! -x "$BUNDLE/bearings" ]; then
  echo "error: $BUNDLE/bearings not found. Run scripts/build.sh first." >&2
  exit 1
fi

echo "==> Installing app bundle to $OPT_DIR"
rm -rf "$OPT_DIR"; mkdir -p "$OPT_DIR"
cp -a "$BUNDLE/." "$OPT_DIR/"

echo "==> Linking launcher into $BIN_DIR"
mkdir -p "$BIN_DIR"
ln -sf "$OPT_DIR/bearings" "$BIN_DIR/bearings"

echo "==> Installing icons"
for s in 16 32 48 64 128 256 512; do
  dir="$ICON_ROOT/${s}x${s}/apps"
  mkdir -p "$dir"
  cp "assets/icons/icon-${s}.png" "$dir/${APP_ID}.png"
done
scal="$ICON_ROOT/scalable/apps"; mkdir -p "$scal"
cp "assets/icon.svg" "$scal/${APP_ID}.svg"

echo "==> Installing desktop entry"
mkdir -p "$DESKTOP_DIR"
sed "s|^Exec=bearings$|Exec=$OPT_DIR/bearings|" \
  "packaging/${APP_ID}.desktop" > "$DESKTOP_DIR/${APP_ID}.desktop"

echo "==> Refreshing caches"
command -v update-desktop-database >/dev/null && update-desktop-database "$DESKTOP_DIR" || true
command -v gtk-update-icon-cache >/dev/null && gtk-update-icon-cache -qtf "$ICON_ROOT" 2>/dev/null || true
command -v kbuildsycoca6 >/dev/null && kbuildsycoca6 --noincremental >/dev/null 2>&1 || true

echo
echo "Installed. Look for 'Bearings' in your app menu, or run: bearings"
echo "(ensure $BIN_DIR is on your PATH for the terminal command)"
