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
  let filter = null;      // active category filter for Deck/Checklist; null = all selected
  let deckJumpId = null;  // a tip id the Deck should open to (set by Home / links)

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
      btn.addEventListener("click", () => {
        // Sidebar nav shows your normal view; a Home "focus" filter only lasts
        // until you navigate via the sidebar.
        App.clearFilter();
        App.navigate(btn.dataset.screen);
      });
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

    // Ask the Deck to open on a specific tip the next time it renders.
    setDeckTo(id) { deckJumpId = id; },
    takeDeckJump() { const id = deckJumpId; deckJumpId = null; return id; },

    navigate(screen) {
      if (!Screens[screen]) screen = "home";
      current = screen;
      document.querySelectorAll(".nav-item").forEach((b) => {
        b.classList.toggle("active", b.dataset.screen === screen);
      });
      const content = document.getElementById("content");
      Screens[screen](content);
      // Reset scroll now and again after fonts swap in (which reflows tall
      // screens); overflow-anchor:none keeps that reflow from shifting scroll.
      content.scrollTop = 0;
      requestAnimationFrame(() => { content.scrollTop = 0; });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { content.scrollTop = 0; });
      }
    },

    currentScreen() { return current; },

    // Dev-only Search prefill passthrough (empty in normal use).
    devSearchQuery(cb) {
      if (backend && backend.dev_search_query) backend.dev_search_query(cb);
      else cb("");
    },

    refreshFooter() {
      const el = document.getElementById("foot-platform");
      if (el) el.textContent = State.get("platform") || "—";
    },

    // Render the persistent shell and land on `screen` (used after onboarding).
    enterMainShell(screen) {
      this.clearFilter();
      renderShell();
      this.navigate(screen || "home");
    },

    // Transient toast (used for Python->JS notifications).
    toast(message) {
      let host = document.getElementById("toast-host");
      if (!host) {
        host = document.createElement("div");
        host.id = "toast-host";
        document.body.appendChild(host);
      }
      const t = document.createElement("div");
      t.className = "toast glass";
      t.textContent = message;
      host.appendChild(t);
      requestAnimationFrame(() => t.classList.add("show"));
      setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 3400);
    },

    // Result of a content-update check (manual or auto).
    onUpdateResult(json) {
      let r = {};
      try { r = JSON.parse(json || "{}"); } catch (e) { return; }
      State.update({ lastChecked: r.checkedAt || null, contentVersion: r.localVersion || null });
      if (r.updated && backend && backend.load_content) {
        backend.load_content(function (cj) {
          try { Content.load(JSON.parse(cj || "{}")); } catch (e) {}
          App.toast(r.message || "Content updated");
          if (current) App.navigate(current);   // re-render with fresh content
        });
      } else {
        App.toast(r.message || "Checked for updates");
        if (current === "settings") App.navigate("settings");
      }
    },

    boot(be, rawState, rawContent) {
      backend = be;
      window.backendRef = be;   // for lazy per-screen bridge calls
      State.init(be, rawState);
      Content.load(rawContent);

      if (be.notify && be.notify.connect) be.notify.connect((m) => App.toast(m));
      if (be.content_update && be.content_update.connect)
        be.content_update.connect((j) => App.onUpdateResult(j));

      const start = (screen, devFilter) => {
        this.enterMainShell(screen);           // clears any filter, renders, navigates
        if (devFilter) { App.setFilter(devFilter); App.navigate(screen); }
        if (State.get("updateAutoCheck") && be.check_content_update) be.check_content_update();
      };

      if (State.get("onboarded")) {
        backend.start_screen(function (dev) {
          const screen = dev && Screens[dev] ? dev : "home";
          if (backend.dev_filter) {            // dev-only focus filter; empty in normal use
            backend.dev_filter(function (f) {
              const cats = f ? f.split(",").map((s) => s.trim()).filter(Boolean) : null;
              start(screen, cats);
            });
          } else {
            start(screen, null);
          }
        });
      } else {
        Onboarding.render(document.getElementById("root"));
      }
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
      backend.load_content(function (rawContentJson) {
        let rawContent = { version: null, tips: [], lookup: [] };
        try { rawContent = JSON.parse(rawContentJson || "{}"); } catch (e) {}
        App.boot(backend, rawState, rawContent);
        console.log("[bearings] booted — content v" + (rawContent.version || "?") +
                    ", " + (rawContent.tips || []).length + " tips");
      });
    });
  });
});
