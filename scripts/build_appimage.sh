#!/usr/bin/env bash
# Wrap the PyInstaller bundle (dist/bearings/) into a portable AppImage.
# Run scripts/build.sh first so dist/bearings/ exists.
#
# appimagetool is fetched to .cache/ if not already present.
set -euo pipefail
cd "$(dirname "$0")/.."

APP_ID="com.kamsiob.bearings"
BUNDLE="dist/bearings"
APPDIR="build/AppDir"
CACHE=".cache"
OUT_DIR="dist"
VERSION="${1:-1.2.0}"
ARCH="${ARCH:-x86_64}"

[ -x "$BUNDLE/bearings" ] || { echo "error: $BUNDLE/bearings missing — run scripts/build.sh first" >&2; exit 1; }

# --- fetch appimagetool if needed ---
mkdir -p "$CACHE"
TOOL="$CACHE/appimagetool"
if [ ! -x "$TOOL" ]; then
  echo "==> Fetching appimagetool"
  curl -sSL -o "$TOOL" "https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage"
  chmod +x "$TOOL"
fi

# --- assemble the AppDir ---
echo "==> Assembling $APPDIR"
rm -rf "$APPDIR"
mkdir -p "$APPDIR/usr/lib/bearings" "$APPDIR/usr/bin" \
         "$APPDIR/usr/share/applications" \
         "$APPDIR/usr/share/metainfo" \
         "$APPDIR/usr/share/icons/hicolor/scalable/apps"
cp -a "$BUNDLE/." "$APPDIR/usr/lib/bearings/"

# AppRun: launch the bundled executable; keep QtWebEngine happy on arbitrary hosts.
cat > "$APPDIR/AppRun" <<'EOF'
#!/bin/bash
HERE="$(dirname "$(readlink -f "${0}")")"
export QTWEBENGINE_CHROMIUM_FLAGS="${QTWEBENGINE_CHROMIUM_FLAGS:---disable-gpu --no-sandbox}"
exec "${HERE}/usr/lib/bearings/bearings" "$@"
EOF
chmod +x "$APPDIR/AppRun"

# Icons: PNG (rasterized) at root + scalable SVG in the theme.
cp "assets/icons/icon-256.png" "$APPDIR/${APP_ID}.png"
cp "assets/icons/icon-256.png" "$APPDIR/.DirIcon"
cp "assets/icon.svg" "$APPDIR/usr/share/icons/hicolor/scalable/apps/${APP_ID}.svg"
for s in 16 32 48 64 128 256 512; do
  d="$APPDIR/usr/share/icons/hicolor/${s}x${s}/apps"; mkdir -p "$d"
  cp "assets/icons/icon-${s}.png" "$d/${APP_ID}.png"
done

# Desktop entry (root copy is what appimagetool reads; also under usr/share).
cp "packaging/${APP_ID}.desktop" "$APPDIR/${APP_ID}.desktop"
cp "packaging/${APP_ID}.desktop" "$APPDIR/usr/share/applications/${APP_ID}.desktop"
# MetaInfo, if present (used by app stores / appimaged).
[ -f "packaging/${APP_ID}.metainfo.xml" ] && \
  cp "packaging/${APP_ID}.metainfo.xml" "$APPDIR/usr/share/metainfo/${APP_ID}.metainfo.xml" || true

# --- build the AppImage ---
mkdir -p "$OUT_DIR"
OUTFILE="$OUT_DIR/Bearings-${VERSION}-${ARCH}.AppImage"
echo "==> Building $OUTFILE"
ARCH="$ARCH" "$TOOL" --appimage-extract-and-run --no-appstream "$APPDIR" "$OUTFILE"

echo
echo "Built: $OUTFILE ($(du -h "$OUTFILE" | cut -f1))"
