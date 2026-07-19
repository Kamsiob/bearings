#!/usr/bin/env python3
"""Bearings by Kamsiob — PySide6 + QtWebEngine desktop app.

A living field guide for people switching to Bazzite. The UI is a local web
front-end (web/) rendered in a QWebEngineView and wired to Python over
QWebChannel. Python owns the window, local state persistence, and the single
opt-in content-update request; the front-end owns everything visual.

Everything runs locally. The only outbound action is the opt-in update check
(Settings) and the external / mailto links the OS opens in the browser or mail
client. Nothing else ever makes a network call.
"""
import os
import sys
from pathlib import Path

# QtWebEngine can trip over some GPU stacks; keep rendering predictable.
os.environ.setdefault("QTWEBENGINE_CHROMIUM_FLAGS", "--disable-gpu")

from PySide6.QtCore import QUrl  # noqa: E402
from PySide6.QtGui import QIcon  # noqa: E402
from PySide6.QtWebChannel import QWebChannel  # noqa: E402
from PySide6.QtWebEngineCore import QWebEnginePage  # noqa: E402
from PySide6.QtWebEngineWidgets import QWebEngineView  # noqa: E402
from PySide6.QtWidgets import QApplication, QMainWindow  # noqa: E402


class AppPage(QWebEnginePage):
    """Routes front-end console.log/warn/error to the terminal for dev visibility."""

    def javaScriptConsoleMessage(self, level, message, line, source):  # noqa: N802
        src = Path(source).name if source else "?"
        print(f"[js:{src}:{line}] {message}", flush=True)

ROOT = Path(__file__).resolve().parent
WEB = ROOT / "web"
ASSETS = ROOT / "assets"
sys.path.insert(0, str(ROOT))

from bearings.backend import Backend  # noqa: E402

APP_NAME = "Bearings"
ORG_NAME = "Kamsiob"


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Bearings by Kamsiob")
        self.resize(1180, 780)
        self.setMinimumSize(900, 620)

        icon_path = ASSETS / "icon.svg"
        if icon_path.exists():
            self.setWindowIcon(QIcon(str(icon_path)))

        self.view = QWebEngineView(self)
        self.view.setPage(AppPage(self.view))

        # The Python <-> JS bridge.
        self.backend = Backend()
        self.channel = QWebChannel()
        self.channel.registerObject("backend", self.backend)
        self.view.page().setWebChannel(self.channel)

        self.view.setUrl(QUrl.fromLocalFile(str(WEB / "index.html")))
        self.setCentralWidget(self.view)


def main() -> int:
    QApplication.setApplicationName(APP_NAME)
    QApplication.setOrganizationName(ORG_NAME)
    QApplication.setDesktopFileName("com.kamsiob.bearings")

    app = QApplication(sys.argv)

    icon_path = ASSETS / "icon.svg"
    if icon_path.exists():
        app.setWindowIcon(QIcon(str(icon_path)))

    window = MainWindow()
    window.show()
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
