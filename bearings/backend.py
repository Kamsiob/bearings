"""Backend — the object exposed to the web UI as `backend` over QWebChannel.

Bridges the web front-end to the thin Python layer: local state persistence,
content loading, and (Phase 12) the single opt-in content-update request. Every
method JS calls is a @Slot; state and content cross the bridge as JSON strings.
"""
import json
import os
import threading
from pathlib import Path

from PySide6.QtCore import QMarginsF, QObject, Signal, Slot, QTimer, QUrl
from PySide6.QtGui import QDesktopServices, QPageLayout, QPageSize
from PySide6.QtWebEngineCore import QWebEnginePage
from PySide6.QtWidgets import QFileDialog

from bearings import __version__, config, cheatsheet_pdf


class Backend(QObject):
    """Exposed to JS as `backend`. Every method the front-end calls is a @Slot."""

    # Python -> JS pushes.
    notify = Signal(str)
    content_update = Signal(str)   # JSON result of an update check

    def __init__(self) -> None:
        super().__init__()

    # --- bridge sanity check -------------------------------------------------
    @Slot(str, result=str)
    def ping(self, message: str) -> str:
        """Round-trip test: the front-end sends a string, we echo it back."""
        return f"pong: {message}"

    @Slot(result=str)
    def app_version(self) -> str:
        return __version__

    @Slot(result=str)
    def start_screen(self) -> str:
        """Dev helper: BEARINGS_START_SCREEN forces the initial screen (empty in
        normal use). Lets screenshots target a specific screen without clicking."""
        return os.environ.get("BEARINGS_START_SCREEN", "")

    @Slot(result=str)
    def dev_search_query(self) -> str:
        """Dev helper: BEARINGS_SEARCH_Q prefills the Search field (empty in
        normal use), so filtered/empty states can be captured deterministically."""
        return os.environ.get("BEARINGS_SEARCH_Q", "")

    @Slot(result=str)
    def dev_filter(self) -> str:
        """Dev helper: BEARINGS_FILTER (comma-separated category keys) sets the
        active Deck/Checklist focus filter, mirroring a Home 'focus' pick."""
        return os.environ.get("BEARINGS_FILTER", "")

    # --- local state (disk-backed, atomic writes) ----------------------------
    @Slot(result=str)
    def load_state(self) -> str:
        """Return persisted user state as a JSON string ({} if none yet)."""
        return json.dumps(config.load_state())

    @Slot(str)
    def save_state(self, state_json: str) -> None:
        """Persist the full user state (a JSON string) from the front-end."""
        try:
            state = json.loads(state_json)
        except (ValueError, TypeError):
            return
        if isinstance(state, dict):
            config.save_state(state)

    # --- content -------------------------------------------------------------
    @Slot(result=str)
    def load_content(self) -> str:
        """Return the active content (cached copy or bundled seed) as JSON."""
        return json.dumps(config.load_content())

    @Slot(result=str)
    def load_cheatsheets(self) -> str:
        """Return the cheat-sheet reference content as JSON."""
        return json.dumps(config.load_cheatsheets())

    @Slot(result=str)
    def content_url(self) -> str:
        """The single public URL the update check contacts (shown in Settings)."""
        return config.CONTENT_UPDATE_URL

    # --- external links ------------------------------------------------------
    @Slot(str)
    def open_url(self, url: str) -> None:
        """Open an external link in the system browser, or a mailto: in the mail
        client. Only http(s) and mailto are allowed."""
        url = (url or "").strip()
        if url.startswith(("http://", "https://", "mailto:")):
            QDesktopServices.openUrl(QUrl(url))

    # --- the one opt-in outbound request -------------------------------------
    @Slot()
    def check_content_update(self) -> None:
        """Check the public content file for a newer version. Runs off the GUI
        thread; the result is delivered via the content_update signal."""
        def worker() -> None:
            result = config.check_for_update()
            self.content_update.emit(json.dumps(result))
        threading.Thread(target=worker, daemon=True).start()

    # --- cheat-sheet PDF export ----------------------------------------------
    @Slot(str)
    def export_cheatsheet(self, sheet_id: str) -> None:
        """Render one cheat sheet to a print-friendly PDF the user chooses a path
        for, then open it so they can print. No network; purely local."""
        sheets = {s.get("id"): s for s in config.load_cheatsheets().get("sheets", [])}
        sheet = sheets.get(sheet_id)
        if not sheet:
            return

        default_name = f"bearings-{sheet_id}.pdf"
        path, _ = QFileDialog.getSaveFileName(
            None, "Save cheat sheet as PDF",
            str(Path.home() / default_name), "PDF files (*.pdf)")
        if not path:
            return
        if not path.lower().endswith(".pdf"):
            path += ".pdf"

        html = cheatsheet_pdf.build_html(sheet)
        page = QWebEnginePage(self)
        self._print_page = page   # keep a reference alive during async printing
        base = QUrl.fromLocalFile(str(config.WEB) + "/")   # so bundled fonts resolve

        def on_load(ok: bool) -> None:
            if not ok:
                self._print_page = None
                return
            layout = QPageLayout(
                QPageSize(QPageSize.Letter), QPageLayout.Orientation.Portrait,
                QMarginsF(0, 0, 0, 0))
            # Small delay lets the bundled fonts finish loading before render.
            QTimer.singleShot(400, lambda: page.printToPdf(path, layout))

        def on_done(fpath: str, success: bool) -> None:
            if success and fpath:
                QDesktopServices.openUrl(QUrl.fromLocalFile(fpath))
                self.notify.emit("Cheat sheet saved as PDF")
            else:
                self.notify.emit("Could not export the cheat sheet")
            self._print_page = None

        page.loadFinished.connect(on_load)
        page.pdfPrintingFinished.connect(on_done)
        page.setHtml(html, base)
