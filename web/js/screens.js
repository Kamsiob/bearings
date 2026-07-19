/* Screen renderers. Each takes the content-region element and fills it.
   Phase 3 ships placeholders; each screen is built out in its own later phase. */
window.Screens = (function () {
  function placeholder(el, title, sub, note) {
    el.innerHTML = `
      <div class="screen">
        <div class="screen-head">
          <h1>${title}</h1>
          <p class="sub">${sub || ""}</p>
        </div>
        <div class="placeholder">${note || "Coming soon."}</div>
      </div>`;
  }

  return {
    home:       (el) => placeholder(el, "Home", "Your reference for living on Bazzite.", "Home screen — Phase 6."),
    lookup:     (el) => placeholder(el, "Familiar Territory", "Start here. Matched to what you already know.", "Lookup table — Phase 7."),
    deck:       (el) => placeholder(el, "Deck", "One tip at a time.", "Deck — Phase 8."),
    checklist:  (el) => placeholder(el, "Checklist", "Everything worth knowing, grouped.", "Checklist — Phase 9."),
    search:     (el) => placeholder(el, "Search", "Find any tip instantly.", "Search — Phase 10."),
    cheatsheet: (el) => placeholder(el, "Cheat Sheet", "Printable one-page references.", "Cheat Sheet — Phase 11."),
    settings:   (el) => placeholder(el, "Settings", "Change your answers anytime.", "Settings — Phase 12."),
    about:      (el) => placeholder(el, "About", "A living reference for Bazzite.", "About — Phase 13."),
  };
})();
