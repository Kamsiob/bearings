#!/usr/bin/env bash
# Build everything distributable: the standalone app bundle + the cheat-sheet PDFs.
# Run from the repo root with the project venv active (or it will use ./.venv).
set -euo pipefail
cd "$(dirname "$0")/.."

PY="${PYTHON:-.venv/bin/python}"
[ -x "$PY" ] || PY="python3"

echo "==> Regenerating cheat-sheet PDFs"
"$PY" scripts/build_cheatsheet_pdfs.py

echo "==> Building standalone bundle with PyInstaller"
"$PY" -m PyInstaller bearings.spec --noconfirm --clean

echo
echo "Done. Standalone bundle: dist/bearings/  (run ./dist/bearings/bearings)"
echo "Install into the KDE app menu with: scripts/install.sh"
