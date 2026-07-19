/* Lookup ("Familiar Territory") — the screen a switcher lands on after
   onboarding. A real table mapping tasks to Linux equivalents, with a
   "Coming from" selector that highlights the app you already know. */
Screens.lookup = function (el) {
  const PLATFORMS = ["Windows", "Mac", "ChromeOS"];
  // Keywords per platform, used to gently emphasise the familiar name.
  const KEYWORDS = {
    Windows:  ["Outlook", "OneNote", "OneDrive", "Microsoft", "Xbox App", "Windows"],
    Mac:      ["Apple Mail", "Apple Notes", "Apple", "Keychain", "Final Cut", "Mac"],
    ChromeOS: ["Google Drive", "Google Calendar", "Google", "Chrome"],
  };

  function highlightFamiliar(text, platform) {
    let out = UI.esc(text);
    const words = KEYWORDS[platform] || [];
    words.forEach((w) => {
      const re = new RegExp("(" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "g");
      out = out.replace(re, '<strong class="fam-hi">$1</strong>');
    });
    return out;
  }

  function rows(platform) {
    return Content.lookup().map((r) => `
      <tr>
        <td class="lk-task">${UI.esc(r.task)}</td>
        <td class="lk-familiar">${highlightFamiliar(r.familiar, platform)}</td>
        <td class="lk-linux">${UI.esc(r.linux)}</td>
        <td class="lk-note">${UI.esc(r.note)}</td>
        <td class="lk-verified">
          <span class="verified-stamp" title="Verified ${UI.esc(r.verified)}">
            <span class="vf-icon">${ICONS.verified()}</span>${UI.esc(r.verified)}
          </span>
        </td>
      </tr>`).join("");
  }

  function draw() {
    const platform = State.get("platform");
    const pills = PLATFORMS.map((p) =>
      `<button class="chip lk-plat${p === platform ? " selected" : ""}" data-plat="${p}">${p}</button>`
    ).join("");

    el.innerHTML = `
      <div class="screen">
        <div class="screen-head">
          <h1>Familiar Territory</h1>
          <p class="sub">Start here. Matched to what you already know.</p>
        </div>

        <div class="lk-controls">
          <span class="mono-label">Coming from</span>
          <div class="lk-plats">${pills}</div>
        </div>

        <div class="glass lk-table-wrap">
          <div class="lk-scroll">
            <table class="lk-table">
              <thead class="glass-strong">
                <tr>
                  <th>Task</th><th>Familiar</th><th>Linux Equivalent</th>
                  <th>Note</th><th>Verified</th>
                </tr>
              </thead>
              <tbody>${rows(platform)}</tbody>
            </table>
          </div>
        </div>
      </div>`;

    el.querySelectorAll(".lk-plat").forEach((btn) => {
      btn.addEventListener("click", () => {
        State.set("platform", btn.dataset.plat);   // persists; updates footer too
        App.refreshFooter();
        draw();
      });
    });
  }

  draw();
};
