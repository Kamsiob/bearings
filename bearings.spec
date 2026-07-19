# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for Bearings by Kamsiob.

Builds a self-contained onedir bundle (dist/bearings/) so the app runs without a
Python environment. Bundles the web front-end, content JSON, and assets; the
PySide6 hooks pull in Qt + QtWebEngine (engine process, resources, ICU data).

Build:  pyinstaller bearings.spec --noconfirm
Run:    ./dist/bearings/bearings
"""
from PyInstaller.utils.hooks import collect_data_files

datas = [
    ("web", "web"),
    ("content", "content"),
    ("assets", "assets"),
]

a = Analysis(
    ["app.py"],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=["bearings", "bearings.backend", "bearings.config", "bearings.cheatsheet_pdf"],
    hookspath=[],
    runtime_hooks=[],
    excludes=["tkinter"],
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="bearings",
    debug=False,
    strip=False,
    upx=False,
    console=False,
    icon="assets/icons/icon-256.png",
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    name="bearings",
)
