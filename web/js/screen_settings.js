/* Settings — three glass panels: platform, focus categories, and the opt-in
   content-update controls. All changes persist immediately. */
Screens.settings = function (el) {
  const PLATFORMS = ["Windows", "Mac", "ChromeOS"];
  let checking = false;

  function fmtWhen(iso) {
    if (!iso) return "Never";
    const d = new Date(iso);
    if (isNaN(d)) return "Never";
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  }

  function draw() {
    const platform = State.get("platform");
    const platPills = PLATFORMS.map((p) =>
      `<button class="chip set-plat${p === platform ? " selected" : ""}" data-plat="${p}">${p}</button>`
    ).join("");

    const catChips = `
      <span class="chip locked selected">
        <span class="ni-icon" style="width:14px;height:14px">${ICONS.lock()}</span> Universal
      </span>` + Content.territories().map((c) =>
      `<button class="chip set-cat${State.hasCategory(c.key) ? " selected" : ""}" data-cat="${c.key}">${UI.esc(c.label)}</button>`
    ).join("");

    const auto = State.get("updateAutoCheck");
    const version = Content.version() || State.get("contentVersion") || "—";
    const lastChecked = fmtWhen(State.get("lastChecked"));

    el.innerHTML = `
      <div class="screen">
        <div class="screen-head">
          <h1>Settings</h1>
          <p class="sub">Change your answers anytime — nothing here leaves the device.</p>
        </div>

        <section class="glass set-panel">
          <h2 class="set-title">Coming from</h2>
          <p class="set-help">Which system you're switching from. Tunes the Lookup table's familiar column.</p>
          <div class="set-row">${platPills}</div>
        </section>

        <section class="glass set-panel">
          <h2 class="set-title">What you use it for</h2>
          <p class="set-help">Filters the Deck and Checklist to your focus areas. It never touches Lookup, which always shows the full table. Universal is always on.</p>
          <div class="set-row">${catChips}</div>
        </section>

        <section class="glass set-panel">
          <h2 class="set-title">Content updates</h2>
          <p class="set-help">Tips and equivalents can go stale faster than app releases. This checks a public file on GitHub for a newer version and swaps it in.</p>

          <label class="set-toggle">
            <span class="set-toggle-label">Check for updates automatically on launch</span>
            <span class="switch${auto ? " on" : ""}" data-act="toggle-auto"><span class="knob"></span></span>
          </label>

          <div class="set-update-row">
            <button class="btn btn-primary set-check" data-act="check"${checking ? " disabled" : ""}>
              ${checking ? "Checking…" : "Check now"}</button>
            <div class="set-update-meta">
              <div><span class="mono-label">Content version</span> <b>${UI.esc(version)}</b></div>
              <div><span class="mono-label">Last checked</span> <b>${UI.esc(lastChecked)}</b></div>
            </div>
          </div>

          <p class="set-note">
            This makes a request to a public file on GitHub. Nothing about you or your device is sent —
            but, as with any web request, your IP address is visible to GitHub for that one request.
          </p>
          <p class="set-url mono-label" id="set-url">—</p>
        </section>
      </div>`;

    el.querySelectorAll(".set-plat").forEach((b) =>
      b.addEventListener("click", () => { State.set("platform", b.dataset.plat); App.refreshFooter(); draw(); }));

    el.querySelectorAll(".set-cat").forEach((b) =>
      b.addEventListener("click", () => { State.toggleCategory(b.dataset.cat); draw(); }));

    el.querySelector('[data-act="toggle-auto"]')?.addEventListener("click", () => {
      State.set("updateAutoCheck", !State.get("updateAutoCheck"));
      draw();
    });

    el.querySelector('[data-act="check"]')?.addEventListener("click", () => {
      if (checking) return;
      checking = true; draw();
      if (window.backendRef && backendRef.check_content_update) backendRef.check_content_update();
      // The result arrives via App.onUpdateResult, which re-navigates to Settings;
      // clear the local checking flag after a moment as a fallback.
      setTimeout(() => { checking = false; }, 12000);
    });

    // Show the actual URL being contacted (honest disclosure).
    if (window.backendRef && backendRef.content_url) {
      backendRef.content_url(function (u) {
        const node = el.querySelector("#set-url");
        if (node) node.textContent = u;
      });
    }
  }

  draw();
};
