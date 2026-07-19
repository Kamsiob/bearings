"""Print-friendly cheat-sheet rendering — a single one-page HTML document per
sheet, styled plain: dark ink on a near-white background, no dark fill, no glow,
so it prints legibly without wasting ink.

Shared by the in-app 'Print this page' export (backend) and the standalone repo
files built in Phase 14, so both stay identical and content stays single-sourced
in content/cheatsheets.json.
"""
from __future__ import annotations

import html as _html


def _esc(s: object) -> str:
    return _html.escape(str(s if s is not None else ""))


PRINT_CSS = """
  @page { size: Letter portrait; margin: 14mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #ffffff; color: #1c1830;
    font-family: "Space Grotesk", -apple-system, system-ui, sans-serif; }
  .page { padding: 6px 2px; }
  header { border-bottom: 2px solid #6C4FE0; padding-bottom: 10px; margin-bottom: 12px; }
  h1 { font-family: "Fraunces", Georgia, serif; font-weight: 600; font-size: 22pt;
    margin: 0 0 2px; color: #241a3d; }
  .subtitle { color: #6C4FE0; font-weight: 600; font-size: 9.5pt; margin: 0 0 2px;
    text-transform: uppercase; letter-spacing: 0.06em; }
  .brand { float: right; text-align: right; font-size: 8pt; color: #8a83a6; margin-top: 2px; }
  .intro { font-size: 9.5pt; line-height: 1.4; color: #40395a; margin: 0 0 12px; }
  .note { font-size: 8.5pt; line-height: 1.35; color: #6b6486; margin: 0 0 10px;
    border-left: 2px solid #d9d3ea; padding-left: 8px; }

  table { width: 100%; border-collapse: collapse; }
  td { padding: 3.2px 6px; vertical-align: top; font-size: 8.7pt; line-height: 1.3;
    border-bottom: 1px solid #ececf4; }
  .cmd { font-family: "IBM Plex Mono", ui-monospace, monospace; font-weight: 600;
    color: #4a2fc0; white-space: nowrap; width: 1%; padding-right: 12px; }
  .keys { font-family: "IBM Plex Mono", ui-monospace, monospace; font-weight: 600;
    color: #241a3d; white-space: nowrap; width: 1%; padding-right: 14px; }
  .desc { color: #3a3352; }

  .cols { column-count: 2; column-gap: 20px; }
  .section { break-inside: avoid; margin-bottom: 8px; }
  .section h2 { font-family: "Fraunces", Georgia, serif; font-weight: 600; font-size: 11pt;
    margin: 0 0 3px; color: #6C4FE0; border-bottom: 1px solid #e4dff1; padding-bottom: 2px; }
  .section table td { border-bottom: none; padding: 2px 6px; }

  .outro { margin-top: 12px; font-size: 8.7pt; color: #40395a; border-top: 1px solid #e4dff1;
    padding-top: 8px; }
  .outro code { font-family: "IBM Plex Mono", ui-monospace, monospace; color: #4a2fc0; }
"""


def _doc(title: str, body: str) -> str:
    return (
        "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">"
        f"<title>{_esc(title)}</title><style>{PRINT_CSS}</style></head>"
        f"<body><div class=\"page\">{body}</div></body></html>"
    )


def _header(sheet: dict) -> str:
    return (
        "<header><div class=\"brand\">Bearings<br>by Kamsiob</div>"
        f"<div class=\"subtitle\">{_esc(sheet.get('subtitle', ''))}</div>"
        f"<h1>{_esc(sheet.get('title', ''))}</h1></header>"
        f"<p class=\"intro\">{_esc(sheet.get('intro', ''))}</p>"
    )


def _ujust_body(sheet: dict) -> str:
    rows = "".join(
        f"<tr><td class=\"cmd\">{_esc(c['name'])}</td>"
        f"<td class=\"desc\">{_esc(c['desc'])}</td></tr>"
        for c in sheet.get("commands", [])
    )
    outro = _esc(sheet.get("outro", "")).replace(
        "ujust update", "<code>ujust update</code>")
    return _header(sheet) + f"<table>{rows}</table>" + (
        f"<p class=\"outro\">{outro}</p>" if outro else "")


def _shortcuts_body(sheet: dict) -> str:
    secs = ""
    for s in sheet.get("sections", []):
        rows = "".join(
            f"<tr><td class=\"keys\">{_esc(i['keys'])}</td>"
            f"<td class=\"desc\">{_esc(i['desc'])}</td></tr>"
            for i in s.get("items", [])
        )
        secs += (f"<div class=\"section\"><h2>{_esc(s['title'])}</h2>"
                 f"<table>{rows}</table></div>")
    note = sheet.get("note")
    note_html = f"<p class=\"note\">{_esc(note)}</p>" if note else ""
    outro = sheet.get("outro", "")
    outro_html = f"<p class=\"outro\">{_esc(outro)}</p>" if outro else ""
    return _header(sheet) + note_html + f"<div class=\"cols\">{secs}</div>" + outro_html


def build_html(sheet: dict) -> str:
    """Return a complete, standalone print-friendly HTML page for one sheet."""
    body = _ujust_body(sheet) if sheet.get("id") == "ujust" else _shortcuts_body(sheet)
    return _doc(sheet.get("title", "Cheat sheet"), body)
