/* App orchestrator: boots the bridge, loads state + content, renders the
   persistent shell (glow field + sidebar), and routes between screens. */
window.App = (function () {
  // Primary nav, then a divider, then the two utility rows. Order is the spec.
  const PRIMARY_NAV = [
    { id: "home",       label: "Home",        icon: "home" },
    { id: "lookup",     label: "Lookup",      icon: "lookup" },
    { id: "deck",       label: "Deck",        icon: "deck" },
    { id: "checklist",  label: "Checklist",   icon: "checklist" },
    { id: "search",     label: "Search",      icon: "search" },
    { id: "cheatsheet", label: "Cheat Sheet", icon: "cheatsheet" },
  ];
  const UTIL_NAV = [
    { id: "settings", label: "Settings", icon: "settings" },
    { id: "about",    label: "About",    icon: "about" },
  ];

  let backend = null;
  let current = null;
  let filter = null;   // active category filter for Deck/Checklist; null = all selected

  function glowMarkup() {
    return `<div id="glow" aria-hidden="true">
      <div class="orb orb-tl"></div>
      <div class="orb orb-br"></div>
      <div class="orb orb-c"></div>
    </div>`;
  }

  function navRow(item, muted) {
    return `<button class="nav-item${muted ? " muted" : ""}" data-screen="${item.id}">
      <span class="ni-icon">${ICONS[item.icon]()}</span>
      <span>${item.label}</span>
    </button>`;
  }

  function renderShell() {
    const platform = State.get("platform");
    document.getElementById("root").innerHTML = `
      ${glowMarkup()}
      <div id="app">
        <aside id="sidebar" class="glass">
          <div class="brand">
            ${ICONS.compass(38, true)}
            <span class="wordmark">
              <span class="wm-main">Bearings</span>
              <span class="wm-sub">by Kamsiob</span>
            </span>
          </div>
          <nav class="nav">
            ${PRIMARY_NAV.map((i) => navRow(i, false)).join("")}
            <div class="nav-divider"></div>
            ${UTIL_NAV.map((i) => navRow(i, true)).join("")}
          </nav>
          <div class="sidebar-foot">
            <div class="coming-from">Coming from <b id="foot-platform">${platform || "—"}</b></div>
          </div>
        </aside>
        <main id="content"></main>
      </div>`;

    document.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => App.navigate(btn.dataset.screen));
    });
  }

  return {
    // Active category filter (Home's territory links, Gamer picks, etc. set this).
    getFilter() { return filter || State.get("categories"); },
    setFilter(cats) { filter = cats; },
    addToFilter(cat) {
      const base = new Set(filter || State.get("categories"));
      base.add(cat);
      filter = Array.from(base);
    },
    clearFilter() { filter = null; },

    navigate(screen) {
      if (!Screens[screen]) screen = "home";
      current = screen;
      document.querySelectorAll(".nav-item").forEach((b) => {
        b.classList.toggle("active", b.dataset.screen === screen);
      });
      const content = document.getElementById("content");
      content.scrollTop = 0;
      Screens[screen](content);
    },

    currentScreen() { return current; },

    refreshFooter() {
      const el = document.getElementById("foot-platform");
      if (el) el.textContent = State.get("platform") || "—";
    },

    boot(be, rawState, rawContent) {
      backend = be;
      State.init(be, rawState);
      Content.load(rawContent);
      renderShell();
      this.navigate("home");   // onboarding gating is added in Phase 5
    },
  };
})();

/* --- Bridge init --------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", function () {
  new QWebChannel(qt.webChannelTransport, function (channel) {
    const backend = channel.objects.backend;
    backend.load_state(function (rawStateJson) {
      let rawState = {};
      try { rawState = JSON.parse(rawStateJson || "{}"); } catch (e) {}
      // Content JSON is wired in Phase 4/7; boot with empty content for now.
      App.boot(backend, rawState, { version: null, tips: [], lookup: [] });
      console.log("[bearings] booted");
    });
  });
});
