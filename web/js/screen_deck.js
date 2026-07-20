/* Deck — one tip at a time, drawn from the active (filtered) set.
   A glass card with a stacked shadow in the tip's own category color, a bookmark
   toggle, prev/next, and a rail previewing the next three titles. */
window.Deck = (function () {
  let el = null;
  let list = [];
  let idx = 0;
  let key = "";       // identity of the current filtered set, to detect changes

  function computeList() {
    const cats = App.getFilter();
    list = Content.tipsFor(cats);
    const newKey = list.map((t) => t.id).join(",");
    if (newKey !== key) { key = newKey; idx = 0; }   // filter changed -> restart
  }

  function render(target) {
    if (target) el = target;
    computeList();

    // Honor a pending jump-to-tip request (from Home / links).
    const jump = App.takeDeckJump();
    if (jump != null) {
      const pos = list.findIndex((t) => String(t.id) === String(jump));
      if (pos >= 0) idx = pos;
    }
    if (idx >= list.length) idx = Math.max(0, list.length - 1);
    if (idx < 0) idx = 0;

    if (!list.length) {
      el.innerHTML = `<div class="screen"><div class="screen-head"><h1>Deck</h1></div>
        <div class="placeholder">No tips in the current filter.</div></div>`;
      return;
    }

    const t = list[idx];
    const catVar = Content.cat(t.category).var;
    const marked = State.isBookmarked(t.id);

    const rail = list.slice(idx + 1, idx + 4).map((n) => `
      <button class="deck-peek" data-id="${n.id}">
        <span class="cat-dot" style="background:var(${Content.cat(n.category).var})"></span>
        <span class="deck-peek-title">${UI.esc(n.title)}</span>
      </button>`).join("") || `<div class="deck-peek-empty">End of the deck.</div>`;

    el.innerHTML = `
      <div class="screen">
        <div class="screen-head deck-head">
          <div>
            <h1>Deck</h1>
            <p class="sub">One tip at a time — swipe through what matters.</p>
          </div>
          <div class="deck-counter mono-label">${idx + 1} of ${list.length}</div>
        </div>

        <div class="deck-layout">
          <div class="deck-stage">
            <div class="deck-stack" style="--cat: var(${catVar})">
              <div class="deck-shadow s2"></div>
              <div class="deck-shadow s1"></div>
              <article class="glass deck-card">
                <div class="deck-card-top">
                  ${UI.catBadge(t.category)}
                  <button class="deck-bookmark${marked ? " on" : ""}" title="${marked ? "Saved" : "Save this tip"}" data-act="bookmark">
                    ${ICONS.bookmark(marked)}
                  </button>
                </div>
                <div class="tag-label deck-tag">${UI.esc(t.tag)}</div>
                <h2 class="deck-title">${UI.esc(t.title)}</h2>
                <p class="deck-body">${UI.esc(t.body)}</p>
              </article>
            </div>
            <div class="deck-controls">
              <button class="btn deck-prev" data-act="prev"${idx === 0 ? " disabled" : ""}>
                <span class="ni-icon">${ICONS.arrowLeft()}</span> Previous</button>
              <button class="btn deck-next" data-act="next"${idx >= list.length - 1 ? " disabled" : ""}>
                Next <span class="ni-icon">${ICONS.arrowRight()}</span></button>
            </div>
          </div>

          <aside class="deck-rail">
            <div class="mono-label">Up next</div>
            <div class="deck-peeks">${rail}</div>
          </aside>
        </div>
      </div>`;

    el.querySelector('[data-act="prev"]')?.addEventListener("click", () => step(-1));
    el.querySelector('[data-act="next"]')?.addEventListener("click", () => step(1));
    el.querySelector('[data-act="bookmark"]')?.addEventListener("click", () => {
      State.toggleBookmark(t.id);
      render();
    });
    el.querySelectorAll(".deck-peek").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pos = list.findIndex((x) => String(x.id) === String(btn.dataset.id));
        if (pos >= 0) { idx = pos; render(); }
      });
    });
  }

  function step(delta) {
    if (!list.length) return;
    idx = Math.min(list.length - 1, Math.max(0, idx + delta));
    render();
  }

  // Arrow-key navigation while the Deck is showing.
  document.addEventListener("keydown", (e) => {
    if (App.currentScreen() !== "deck") return;
    if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  return { render };
})();

Screens.deck = function (el) { Deck.render(el); };
