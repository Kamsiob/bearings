/* Shared render helpers used across screens. */
window.UI = (function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // A category pill with its own glow (color driven by data-cat in CSS).
  function catBadge(catKey) {
    const c = Content.cat(catKey);
    return `<span class="cat-badge" data-cat="${catKey}">${esc(c.label)}</span>`;
  }

  // Small colored dot for a category (used in lists).
  function catDot(catKey) {
    const c = Content.cat(catKey);
    return `<span class="cat-dot" style="background:var(${c.var})"></span>`;
  }

  // Deterministic "featured today" pick: rotates once per calendar day.
  function dailyIndex(len) {
    if (!len) return 0;
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const day = Math.floor((now - start) / 86400000);
    return day % len;
  }

  return { esc, catBadge, catDot, dailyIndex };
})();
