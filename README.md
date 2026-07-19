<h1 align="center">Bearings <sub><sup>by Kamsiob</sup></sub></h1>

<p align="center">
  A living field guide for people switching to <a href="https://bazzite.gg">Bazzite</a> —
  the gaming-focused, immutable, Fedora-based Linux distro.
  The things a newcomer doesn't know to ask about yet, a lookup table matching the apps
  you already use to their Linux equivalents, and a reference worth coming back to.
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue"></a>
  <img alt="Python 3.10+" src="https://img.shields.io/badge/python-3.10%2B-blue">
  <img alt="Platform: Linux" src="https://img.shields.io/badge/platform-Linux-lightgrey">
  <img alt="Telemetry: none" src="https://img.shields.io/badge/telemetry-none-brightgreen">
</p>

> **Everything stays local. No accounts, no telemetry, no analytics, nothing phones home.**
> The only time it touches the internet is one *opt-in* content-update check against a public
> file on GitHub, and when you tap an external link (opens your browser) or the feedback link
> (opens your mail app). Nothing else ever makes a network call.

Built with PySide6 + QtWebEngine — a local HTML/CSS/JS interface with a thin Python layer
handling local file reads/writes, the window, and that one outbound update request.

## Run it

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

More detail — content structure, packaging, cheat sheets — arrives as the app is built out.

## License

[MIT](LICENSE) — free and open source.
