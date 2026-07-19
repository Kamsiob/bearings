"""Backend — the object exposed to the web UI as `backend` over QWebChannel.

Bridges the web front-end to the thin Python layer: local state persistence and
(later) the single opt-in content-update request. Every method JS calls is a
@Slot. State is passed as JSON strings across the bridge.
"""
import json

from PySide6.QtCore import QObject, Signal, Slot

from bearings import __version__

# Phase 3 uses an in-memory store so the shell is runnable; Phase 4 replaces the
# read/write internals with a real on-disk state file (survives restarts).
_MEM_STATE: dict = {}


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

    # --- local state (in-memory in Phase 3; disk-backed in Phase 4) ----------
    @Slot(result=str)
    def load_state(self) -> str:
        """Return the persisted user state as a JSON string ({} if none)."""
        return json.dumps(_MEM_STATE)

    @Slot(str)
    def save_state(self, state_json: str) -> None:
        """Persist the full user state (a JSON string) from the front-end."""
        global _MEM_STATE
        try:
            _MEM_STATE = json.loads(state_json)
        except (ValueError, TypeError):
            pass
