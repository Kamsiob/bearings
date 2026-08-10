<h1 align="center">Bearings <sub><sup>by Kamsiob</sup></sub></h1>

<p align="center">
  A living field guide for people switching to <a href="https://bazzite.gg">Bazzite</a> —
  the gaming-focused, immutable, Fedora-based Linux distro.
  The things a newcomer doesn't know to ask about yet, a lookup table matching the apps
  you already use to their Linux equivalents, and a reference worth coming back to.
</p>

<p align="center">
  <img alt="License: AGPL v3" src="https://img.shields.io/badge/license-AGPL%20v3-blue">
  <img alt="Python 3.10+" src="https://img.shields.io/badge/python-3.10%2B-blue">
  <img alt="Platform: Linux" src="https://img.shields.io/badge/platform-Linux%20(KDE)-lightgrey">
  <img alt="Telemetry: none" src="https://img.shields.io/badge/telemetry-none-brightgreen">
</p>

<p align="center">
  <img src="screenshots/lookup.png" width="840" alt="Lookup — the Familiar Territory table matching apps you know to their Linux equivalents">
</p>

<table align="center">
  <tr>
    <td><img src="screenshots/home.png" width="410" alt="Home — today's bearing and your seven territories with live tip counts"></td>
    <td><img src="screenshots/deck.png" width="410" alt="Deck — one tip at a time, here a Media &amp; Home Theater tip"></td>
  </tr>
  <tr>
    <td><img src="screenshots/checklist.png" width="410" alt="Checklist — every tip grouped by category, checkable"></td>
    <td><img src="screenshots/cheatsheet.png" width="410" alt="Cheat Sheet — printable one-pagers"></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><img src="screenshots/about.png" width="410" alt="About — the version check: one button, pressed by you, never on its own"></td>
  </tr>
</table>

> **Everything stays local. No accounts, no telemetry, no analytics, nothing phones home.**
> Bearings makes exactly two kinds of network request, both of which a person has to ask for:
> an *opt-in* content-update check against a public file on GitHub (Settings, off by default),
> and the *press-only* version check on the About screen, which asks GitHub's public releases
> endpoint whether a newer Bearings exists. Neither runs on a timer, and the version check has
> no launch path at all. Beyond those, tapping an external link opens your browser and the
> feedback link opens your mail app. There are no other network calls — no CDN fonts, no
> `fetch`, no browser storage.

Built with **PySide6 + QtWebEngine**: the interface is local HTML/CSS/JS in a `QWebEngineView`,
with a thin Python layer underneath (over `QWebChannel`) handling local file reads/writes, the
window, and that single outbound update request.

---

## What's inside

**96 tips across seven categories** — Universal, Productivity, Creator, Gamer, Coder,
Privacy & Self-Hosting, and Media & Home Theater (private media servers, ripping your own discs,
getting it all onto the TV) — plus a **17-row Familiar Territory table** matching the apps you
already use to their Bazzite equivalents, and two printable cheat sheets. Tips are tagged
*Concept*, *Trick*, *Fix*, *Gotcha*, *Reassurance*, or *Habit*, and you pick which categories you
care about; Universal is always on.

## Screens

- **Home** — a returning-user landing page: a rotating *Today's bearing*, your *territories*
  (categories with live counts), and quick tiles.
- **Lookup** *(Familiar Territory)* — a table mapping tasks to Linux equivalents, tuned to the
  system you're coming from.
- **Deck** — one tip at a time, filtered to your focus areas, with bookmarks.
- **Checklist** — every tip grouped by category, checkable, with progress that persists.
- **Search** — instant, on-device filtering across every tip.
- **Cheat Sheet** — two printable one-pagers (ujust commands, KDE keyboard shortcuts).
- **Settings** — change your platform/categories anytime; opt into content updates.
- **About** — links, feedback, the promises above, and a **version check**: one button that
  asks whether a newer Bearings has been published, and tells you how to get it for the way you
  installed it (app store for a Flatpak, releases page for an AppImage). It runs only when pressed.

## Run it from source

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

First launch shows a two-question onboarding (platform + focus areas), then lands on **Lookup**.

## Where your data lives

Nothing leaves the machine. Two local JSON files, following the XDG spec:

| File | Location | Holds |
|------|----------|-------|
| `state.json` | `~/.config/bearings/` | platform, categories, checklist, bookmarks, update toggle, last-checked, cached content version |
| `content.json` (cache) | `~/.local/share/bearings/` | the active content, seeded from the bundled copy, replaced only when a newer version is pulled |

To fully reset the app, delete `~/.config/bearings` and `~/.local/share/bearings`.

## The content JSON (editing tips & equivalents)

All tips and lookup entries live in **`content/content.json`** — a single file with a top-level
`version` string. Edit it directly; bump `version` (dotted integers, e.g. `1.1.0` → `1.2.0`) so
clients recognise it as newer.

```jsonc
{
  "version": "1.2.0",
  "tips": [
    {
      "id": 1,
      "category": "universal",   // universal | productivity | creator | gamer | coder | privacy | media
      "tag": "Concept",          // Concept | Trick | Fix | Gotcha | Reassurance | Habit (closed list)
      "title": "…",
      "body": "One to three sentences."
    }
  ],
  "lookup": [
    {
      "id": 1,
      "task": "Email",
      "familiar": "Outlook or Apple Mail",   // the app being replaced
      "linux": "Thunderbird",
      "note": "One honest line about the trade-off.",
      "verified": "July 2026"
    }
  ]
}
```

Categories and tags are **closed vocabularies** — don't invent new ones.

The app ships with this file bundled, so it works fully offline from first launch. In **Settings**,
an opt-in toggle (off by default) checks a public copy on GitHub for a newer `version` and swaps it
in; a **Check now** button does a one-off pull. Any failure is silent and keeps the cached copy.

> **Note on the update source.** The check fetches
> `raw.githubusercontent.com/kamsiob/bearings/main/content/content.json` — the content file in this
> public repo. Nothing about the user or device is ever sent; as with any web request, the source IP
> is visible to GitHub for that one request. To repoint it, change `CONTENT_UPDATE_URL` in
> `bearings/config.py`.

## Cheat sheets

The two one-pagers also live in the repo as standalone, print-ready PDFs (light background, dark
ink) so they can be opened and printed without launching the app:

- `cheatsheets/ujust-commands.pdf`
- `cheatsheets/keyboard-shortcuts.pdf`

Both are generated from `content/cheatsheets.json` (single source, shared with the in-app *Print
this page* button). Regenerate them with:

```bash
python scripts/build_cheatsheet_pdfs.py
```

## Build & install the desktop app

```bash
pip install -r requirements-dev.txt   # adds PyInstaller
scripts/build.sh                       # -> dist/bearings/  (runs without a Python env)
scripts/install.sh                     # installs into the KDE app menu under ~/.local
```

`install.sh` places the bundle, launcher, icons, and `com.kamsiob.bearings.desktop` under
`~/.local` (no root needed); `scripts/uninstall.sh` removes them cleanly. After installing, launch
**Bearings** from the app menu or run `bearings`.

## Project layout

```
app.py                     PySide6 window + QWebChannel bridge
bearings/                  thin Python layer
  backend.py               slots/signals exposed to the UI
  config.py                local state + content cache + the opt-in content update
  release_check.py         the About screen's press-only "is there a newer Bearings?" check
  cheatsheet_pdf.py        print-friendly cheat-sheet renderer (app + standalone PDFs)
web/                       the interface (HTML/CSS/JS), bundled fonts, no CDN
content/                   content.json (tips + lookup) and cheatsheets.json
cheatsheets/               standalone print-ready PDFs
assets/                    icon.svg + rasterized PNGs
packaging/                 com.kamsiob.bearings.desktop
scripts/                   build / install / uninstall / PDF generation
bearings.spec              PyInstaller build definition
```

## License

[GNU AGPLv3](LICENSE) — free, open source, and copyleft. You can use, modify, and fork it; if you run a modified version as a hosted or network service, AGPLv3 requires releasing your source changes too. Fonts (Fraunces, Space Grotesk, IBM Plex Mono) are bundled
under the SIL Open Font License; see `web/fonts/LICENSES.md`.
