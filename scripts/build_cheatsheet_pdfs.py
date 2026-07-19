#!/usr/bin/env python3
"""Render the two cheat sheets to standalone one-page PDFs in cheatsheets/.

These are the same print-friendly (light background, dark ink) pages the app's
'Print this page' button produces, so they can be opened and printed without
launching Bearings at all. Content comes from content/cheatsheets.json.

Usage:  python scripts/build_cheatsheet_pdfs.py
"""
import os
import sys
from pathlib import Path

os.environ.setdefault("QTWEBENGINE_CHROMIUM_FLAGS", "--disable-gpu")

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from PySide6.QtCore import QMarginsF, QTimer, QUrl  # noqa: E402
from PySide6.QtGui import QPageLayout, QPageSize  # noqa: E402
from PySide6.QtWebEngineCore import QWebEnginePage  # noqa: E402
from PySide6.QtWidgets import QApplication  # noqa: E402

from bearings import cheatsheet_pdf, config  # noqa: E402

OUT_DIR = ROOT / "cheatsheets"
FILENAMES = {"ujust": "ujust-commands.pdf", "shortcuts": "keyboard-shortcuts.pdf"}


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sheets = {s["id"]: s for s in config.load_cheatsheets().get("sheets", [])}
    app = QApplication([])
    base = QUrl.fromLocalFile(str(config.WEB) + "/")
    pages: list = []
    remaining = {"n": len(FILENAMES)}
    ok_all = {"v": True}

    def make(sheet_id: str, out_path: Path) -> None:
        page = QWebEnginePage()
        pages.append(page)   # keep alive

        def on_load(ok: bool) -> None:
            layout = QPageLayout(QPageSize(QPageSize.Letter),
                                 QPageLayout.Orientation.Portrait, QMarginsF(0, 0, 0, 0))
            QTimer.singleShot(500, lambda: page.printToPdf(str(out_path), layout))

        def on_done(fpath: str, success: bool) -> None:
            print(f"{'ok ' if success else 'FAIL'} {out_path.name}")
            ok_all["v"] = ok_all["v"] and success
            remaining["n"] -= 1
            if remaining["n"] <= 0:
                QTimer.singleShot(150, app.quit)

        page.loadFinished.connect(on_load)
        page.pdfPrintingFinished.connect(on_done)
        page.setHtml(cheatsheet_pdf.build_html(sheets[sheet_id]), base)

    for sid, name in FILENAMES.items():
        if sid in sheets:
            make(sid, OUT_DIR / name)

    QTimer.singleShot(15000, app.quit)   # hard timeout
    app.exec()
    return 0 if ok_all["v"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
