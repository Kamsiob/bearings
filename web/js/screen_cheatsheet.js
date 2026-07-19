/* Cheat Sheet — two printable one-pagers (ujust commands, keyboard shortcuts)
   as tabs. On-screen uses the app's dark glass styling; the Print button hands
   the sheet to Python, which renders a clean light-background PDF and opens it. */
window.Cheatsheets = (function () {
  let cache = null;
  return {
    load(cb) {
      if (cache) { cb(cache); return; }
      if (window.backendRef && backendRef.load_cheatsheets) {
        backendRef.load_cheatsheets(function (json) {
          try { cache = JSON.parse(json || "{}"); } catch (e) { cache = { sheets: [] }; }
          cb(cache);
        });
      } else { cb({ sheets: [] }); }
    },
  };
})();

Screens.cheatsheet = function (el) {
  let active = "ujust";

  Cheatsheets.load(function (data) {
    const sheets = {};
    (data.sheets || []).forEach((s) => { sheets[s.id] = s; });

    function ujustHtml(s) {
      const rows = (s.commands || []).map((c) => `
        <tr><td class="cs-cmd">${UI.esc(c.name)}</td>
            <td class="cs-desc">${UI.esc(c.desc)}</td></tr>`).join("");
      return `
        <p class="cs-intro">${UI.esc(s.intro)}</p>
        <div class="glass cs-panel"><table class="cs-table"><tbody>${rows}</tbody></table></div>
        <p class="cs-outro">${UI.esc(s.outro)}</p>`;
    }

    function shortcutsHtml(s) {
      const secs = (s.sections || []).map((sec) => {
        const rows = (sec.items || []).map((i) => `
          <tr><td class="cs-keys">${UI.esc(i.keys)}</td>
              <td class="cs-desc">${UI.esc(i.desc)}</td></tr>`).join("");
        return `<section class="cs-sec">
            <h3 class="cs-sec-title">${UI.esc(sec.title)}</h3>
            <table class="cs-table"><tbody>${rows}</tbody></table>
          </section>`;
      }).join("");
      const note = s.note ? `<p class="cs-note">${UI.esc(s.note)}</p>` : "";
      return `
        <p class="cs-intro">${UI.esc(s.intro)}</p>
        ${note}
        <div class="glass cs-panel cs-cols">${secs}</div>
        <p class="cs-outro">${UI.esc(s.outro)}</p>`;
    }

    function draw() {
      const s = sheets[active];
      const bodyHtml = !s ? `<div class="placeholder">Cheat sheet unavailable.</div>`
        : (active === "ujust" ? ujustHtml(s) : shortcutsHtml(s));
      const tab = (id, label) =>
        `<button class="cs-tab${active === id ? " on" : ""}" data-tab="${id}">${label}</button>`;

      el.innerHTML = `
        <div class="screen">
          <div class="screen-head">
            <h1>Cheat Sheet</h1>
            <p class="sub">Two references worth keeping — print either as a clean one-pager.</p>
          </div>
          <div class="cs-bar">
            <div class="cs-tabs">${tab("ujust", "ujust commands")}${tab("shortcuts", "Keyboard shortcuts")}</div>
            <button class="btn cs-print" data-print="${active}">
              <span class="ni-icon">${ICONS.print()}</span> Print this page</button>
          </div>
          <div class="cs-body">${bodyHtml}</div>
        </div>`;

      el.querySelectorAll(".cs-tab").forEach((b) =>
        b.addEventListener("click", () => { active = b.dataset.tab; draw(); }));
      el.querySelector(".cs-print")?.addEventListener("click", () => {
        if (window.backendRef && backendRef.export_cheatsheet) backendRef.export_cheatsheet(active);
      });
    }

    draw();
  });
};
