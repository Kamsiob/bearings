# Changelog

All notable changes to **Bearings** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-08-10

A content release: a whole new category, and a lot of new tips across the existing ones.
Content JSON version `1.2.0`.

### Added
- **Media & Home Theater**, a seventh category, covering the leisure side of a home setup:
  a private Jellyfin media server, ripping your own discs with MakeMKV and HandBrake, the
  one-time udev rule an optical drive needs, rebadged external Blu-ray drives, direct play
  and hardware video acceleration, an honest note on where ripping sits legally in the US,
  Android TV boxes, and quieting a streaming box down. 8 tips, its own rose fill (`#F472B6`)
  and film-clapper mark.
- **Category marks** — every category now carries a line icon in its own color, shown in the
  Home territories panel and the Checklist card headers.
- **20 new tips overall** (76 to 96): GearLever and the AMD UMA Frame Buffer Size setting in
  Universal; the full registry path a container image needs, the SELinux relabel flag on a
  mounted volume, scheduled container updates, and release feeds in Coder; SearXNG and Immich
  in Privacy & Self-Hosting; the Affinity community build, exporting to open formats while it
  works, and Photopea in Creator.
- **Four new Familiar Territory rows** (13 to 17): graphic design, media server, ripping discs,
  and managing standalone apps.
- About screen now carries the fuller AGPLv3 notice: a copyright line, a plain no-warranty line,
  and a link to the full license (opens in the browser).
- Flatpak packaging prepared for a Flathub submission — app ID `io.github.kamsiob.Bearings`,
  building for x86_64 and aarch64. (Submission is in progress; not yet published on Flathub.)

### Changed
- **Relicensed from MIT to the GNU AGPLv3**, effective from this point forward. AGPLv3 still
  permits commercial use and forking, but requires anyone who modifies the code and runs it as a
  hosted or network service to release their modified source too. Already-released v1.0.0 binaries
  remain under MIT for anyone who already has them — that grant can't be revoked.
- Three existing tips were improved in place rather than duplicated: the one-command update tip
  (now Universal, and it names the channels software actually arrives through), the systemd
  services tip (linger spelled out as a one-time command), and the Tailscale tip (reaching
  self-hosted services from away from home). Two more, container isolation and keeping each
  service's data in a folder you chose, were already covered and left alone.

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

[Unreleased]: https://github.com/kamsiob/bearings/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/kamsiob/bearings/releases/tag/v1.1.0
[1.0.0]: https://github.com/kamsiob/bearings/releases/tag/v1.0.0
