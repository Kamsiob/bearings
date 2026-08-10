"""The user-triggered "is there a newer Bearings?" check.

Deliberately separate from the content update in config.py. That one refreshes
the *tips and equivalents*; this one asks whether a newer *app* has been
published. Keeping them in different modules keeps the two from blurring
together, in the code and in the interface.

The hard rule: nothing in here ever runs on its own. There is no timer, no
launch hook, no background thread started at boot. `check_latest_release()` is
called from exactly one place, the About screen's button, in response to a tap.
If the person never taps it, this module never opens a socket.

Nothing about the user or the device is sent: it is a plain GET of one public
API endpoint (the request's source IP is visible to GitHub, as with any web
request).
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from bearings import __version__
from bearings.config import is_newer

# The public endpoint for the newest published release, and the human page to
# send people to when there is one.
LATEST_RELEASE_API = "https://api.github.com/repos/Kamsiob/bearings/releases/latest"
RELEASES_PAGE = "https://github.com/Kamsiob/bearings/releases/latest"

# How the running copy got here. Decides what we tell the person to do about an
# update, so it must never guess: anything uncertain falls back to "unknown",
# which just points at the releases page.
FLATPAK = "flatpak"      # managed by the system; must not self-update
APPIMAGE = "appimage"    # a single portable file the person manages
BUNDLE = "bundle"        # the standalone build (scripts/install.sh)
SOURCE = "source"        # running from a checkout
UNKNOWN = "unknown"


def install_kind() -> str:
    """Best-effort, conservative detection of how this copy was installed."""
    if os.environ.get("FLATPAK_ID") or Path("/.flatpak-info").exists():
        return FLATPAK
    # The AppImage runtime exports these to the app it launches.
    if os.environ.get("APPIMAGE") or os.environ.get("APPDIR"):
        return APPIMAGE
    if getattr(sys, "frozen", False):
        return BUNDLE
    if (Path(__file__).resolve().parent.parent / "app.py").exists():
        return SOURCE
    return UNKNOWN


def _version_from(payload: dict) -> str | None:
    """Pull a dotted version out of a release payload ('v1.2.0' -> '1.2.0')."""
    raw = payload.get("tag_name") or payload.get("name") or ""
    raw = str(raw).strip()
    if raw[:1].lower() == "v":
        raw = raw[1:]
    # Only accept something that actually looks like a version.
    head = raw.split()[0] if raw else ""
    parts = head.split(".")
    if head and all(p.isdigit() for p in parts if p):
        return head
    return None


def check_latest_release(url: str = LATEST_RELEASE_API, timeout: int = 8) -> dict:
    """Ask GitHub for the newest published release and compare it to this copy.

    Never raises. On any failure (no connection, GitHub unreachable, a reply we
    can't read) it returns ok=False with a calm message, so the interface can
    say so plainly and move on.
    """
    current = __version__
    kind = install_kind()
    checked_at = datetime.now(timezone.utc).isoformat()
    base = {"current": current, "install": kind, "checkedAt": checked_at,
            "releasesUrl": RELEASES_PAGE}

    try:
        req = urllib.request.Request(
            url, headers={"User-Agent": f"Bearings/{current}",
                          "Accept": "application/vnd.github+json"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, ValueError, OSError, TimeoutError):
        return {**base, "ok": False, "newer": False, "latest": None,
                "message": "Couldn't check right now. Try again later."}

    if not isinstance(payload, dict):
        return {**base, "ok": False, "newer": False, "latest": None,
                "message": "Couldn't check right now. Try again later."}

    latest = _version_from(payload)
    if not latest:
        return {**base, "ok": False, "newer": False, "latest": None,
                "message": "Couldn't check right now. Try again later."}

    page = payload.get("html_url") or RELEASES_PAGE
    if is_newer(latest, current):
        return {**base, "ok": True, "newer": True, "latest": latest,
                "releasesUrl": page,
                "message": f"You have {current}. Version {latest} is available."}
    return {**base, "ok": True, "newer": False, "latest": latest,
            "message": "You're on the latest version."}
