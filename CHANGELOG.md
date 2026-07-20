# Changelog

All notable changes to **Bearings** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Relicensed from MIT to the GNU AGPLv3**, effective from this point forward. AGPLv3 still
  permits commercial use and forking, but requires anyone who modifies the code and runs it as a
  hosted or network service to release their modified source too. Already-released v1.0.0 binaries
  remain under MIT for anyone who already has them — that grant can't be revoked.

### Added
- About screen now carries the fuller AGPLv3 notice: a copyright line, a plain no-warranty line,
  and a link to the full license (opens in the browser).
- Flatpak packaging prepared for a Flathub submission — app ID `io.github.kamsiob.Bearings`,
  building for x86_64 and aarch64. (Submission is in progress; not yet published on Flathub.)

## [1.0.0] - 2026-07-19

First public release. Licensed under MIT (see *Unreleased* for the move to AGPLv3).

### Added
- **Eight screens** — Home, Lookup (*Familiar Territory*), Deck, Checklist, Search, Cheat Sheet,
  Settings, and About.
- **76 field-guide tips** across six categories (Universal, Productivity, Creator, Gamer, Coder,
  Privacy & Self-Hosting), plus a 13-row table mapping the apps you already use to their Bazzite
  equivalents.
- **Two printable one-page cheat sheets** — the most useful `ujust` commands and KDE keyboard
  shortcuts — with in-app PDF export and standalone PDFs in the repo.
- **First-run onboarding** (where you're coming from + what you'll use it for) and per-topic
  filtering of the Deck and Checklist.
- **Opt-in content updates** — off by default; the only time the app touches the network is a
  version check against a public file on GitHub. No accounts, no telemetry, nothing else phones home.
- **Distribution** — a portable AppImage and a standalone Linux bundle, plus KDE desktop
  integration (app icon and launcher).

[Unreleased]: https://github.com/kamsiob/bearings/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/kamsiob/bearings/releases/tag/v1.0.0
