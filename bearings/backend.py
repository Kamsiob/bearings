"""Backend — the object exposed to the web UI as `backend` over QWebChannel.

Phase 2 scope: just enough to prove the bridge works (a ping round-trip and a
version read). Local state persistence and the content-update request are added
in later phases.
"""
from PySide6.QtCore import QObject, Signal, Slot

from bearings import __version__


class Backend(QObject):
    """Exposed to JS as `backend`. Every method the front-end calls is a @Slot."""

    # Python -> JS pushes (used more heavily in later phases).
    notify = Signal(str)

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
