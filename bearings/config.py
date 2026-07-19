"""Local persistence — the only place Bearings writes to disk.

Two files, both local, both plain JSON:

* state.json   — user preferences and progress (platform, categories, checklist,
                 bookmarks, update toggle, last-checked, cached content version).
* content.json — a cached copy of the content, seeded from the bundled file and
                 replaced only when a newer version is pulled (Settings).

Locations follow the XDG base-directory spec so uninstalling is a clean delete.
No database, no network — writes are atomic (temp file + replace).
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

APP_DIR = "bearings"

# The one public file the app ever fetches. Points at the project repo's raw
# content.json — a plain version check, no personal data sent. If it isn't
# publicly reachable (e.g. the repo is private), the check fails silently and
# the cached copy is kept.
CONTENT_UPDATE_URL = (
    "https://raw.githubusercontent.com/kamsiob/bearings/main/content/content.json"
)
ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
BUNDLED_CONTENT = ROOT / "content" / "content.json"
BUNDLED_CHEATSHEETS = ROOT / "content" / "cheatsheets.json"


def _xdg(env: str, default: Path) -> Path:
    raw = os.environ.get(env, "").strip()
    base = Path(raw) if raw else default
    return base / APP_DIR


def config_dir() -> Path:
    return _xdg("XDG_CONFIG_HOME", Path.home() / ".config")


def data_dir() -> Path:
    return _xdg("XDG_DATA_HOME", Path.home() / ".local" / "share")


def state_file() -> Path:
    return config_dir() / "state.json"


def content_cache_file() -> Path:
    return data_dir() / "content.json"


def _read_json(path: Path) -> dict | None:
    try:
        with path.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
        return data if isinstance(data, dict) else None
    except (OSError, ValueError):
        return None


def _write_json(path: Path, data: dict) -> bool:
    """Atomic write: temp file in the same dir, then replace."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(path.suffix + ".tmp")
        with tmp.open("w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
        os.replace(tmp, path)
        return True
    except OSError:
        return False


# --- user state ----------------------------------------------------------
def load_state() -> dict:
    return _read_json(state_file()) or {}


def save_state(state: dict) -> bool:
    return _write_json(state_file(), state)


# --- content -------------------------------------------------------------
def load_bundled_content() -> dict:
    return _read_json(BUNDLED_CONTENT) or {"version": None, "tips": [], "lookup": []}


def load_content() -> dict:
    """Return the newest valid content: cached copy if its version is >= the
    bundled one, otherwise the bundled seed (which also refreshes the cache)."""
    bundled = load_bundled_content()
    cached = _read_json(content_cache_file())
    if cached and is_newer(cached.get("version"), bundled.get("version"), or_equal=True):
        return cached
    # No cache, or a stale cache (older app shipped with newer seed) -> reseed.
    save_content_cache(bundled)
    return bundled


def save_content_cache(content: dict) -> bool:
    return _write_json(content_cache_file(), content)


def load_cheatsheets() -> dict:
    """Static reference content (ujust + shortcuts). Bundled, not user-editable."""
    return _read_json(BUNDLED_CHEATSHEETS) or {"version": None, "sheets": []}


# --- version comparison --------------------------------------------------
def _parse(version: str | None) -> tuple:
    if not version:
        return (-1,)
    parts = []
    for chunk in str(version).replace("-", ".").split("."):
        parts.append(int(chunk) if chunk.isdigit() else 0)
    return tuple(parts) if parts else (-1,)


def is_newer(candidate: str | None, current: str | None, or_equal: bool = False) -> bool:
    """True if `candidate` is a newer version than `current` (dotted ints)."""
    a, b = _parse(candidate), _parse(current)
    return a >= b if or_equal else a > b


# --- the single opt-in update check --------------------------------------
def _valid_content(data: object) -> bool:
    return (isinstance(data, dict) and isinstance(data.get("tips"), list)
            and len(data["tips"]) > 0)


def check_for_update(url: str = CONTENT_UPDATE_URL, timeout: int = 8) -> dict:
    """Fetch the public content file, compare versions, and replace the local
    cache only if the remote copy is strictly newer. Never raises — on any
    failure it returns ok=False and the cached copy is left untouched.

    Nothing about the user or device is sent; this is a plain GET of one public
    file (the request's source IP is visible to GitHub, as with any web request).
    """
    local = load_content()
    local_v = local.get("version")
    checked_at = datetime.now(timezone.utc).isoformat()

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Bearings/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            remote = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, ValueError, OSError, TimeoutError):
        return {"ok": False, "updated": False, "localVersion": local_v,
                "remoteVersion": None, "checkedAt": checked_at,
                "message": "Couldn't reach GitHub — keeping the current copy."}

    remote_v = remote.get("version") if isinstance(remote, dict) else None
    if _valid_content(remote) and is_newer(remote_v, local_v):
        save_content_cache(remote)
        return {"ok": True, "updated": True, "localVersion": remote_v,
                "remoteVersion": remote_v, "checkedAt": checked_at,
                "message": f"Updated to v{remote_v}."}
    return {"ok": True, "updated": False, "localVersion": local_v,
            "remoteVersion": remote_v, "checkedAt": checked_at,
            "message": "You're on the latest content."}
