/* Search — live, client-side filtering across tip titles and bodies. No network.
   Results are a divided list: category badge on the left, title + snippet right. */
Screens.search = function (el) {
  el.innerHTML = `
    <div class="screen">
      <div class="screen-head">
        <h1>Search</h1>
        <p class="sub">Find any tip instantly — titles and bodies, all on-device.</p>
      </div>
      <div class="sr-field glass">
        <span class="sr-icon">${ICONS.search()}</span>
        <input id="sr-input" type="text" placeholder="Search tips…" autocomplete="off" spellcheck="false">
      </div>
      <div id="sr-results" class="sr-results"></div>
    </div>`;

  const input = el.querySelector("#sr-input");
  const out = el.querySelector("#sr-results");
  const tips = Content.tips();

  function snippet(body, q) {
    const max = 150;
    let text = body;
    if (q) {
      const i = body.toLowerCase().indexOf(q.toLowerCase());
      if (i > 40) text = "…" + body.slice(i - 30);
    }
    if (text.length > max) text = text.slice(0, max).replace(/\s+\S*$/, "") + "…";
    return text;
  }

  function mark(text, q) {
    const safe = UI.esc(text);
    if (!q) return safe;
    const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return safe.replace(re, "<mark>$1</mark>");
  }

  function draw() {
    const q = input.value.trim();
    const ql = q.toLowerCase();
    const matches = !q ? tips : tips.filter((t) =>
      t.title.toLowerCase().includes(ql) || t.body.toLowerCase().includes(ql));

    if (!matches.length) {
      out.innerHTML = `<div class="sr-empty">No tips match “${UI.esc(q)}”. Try a different word.</div>`;
      return;
    }

    out.innerHTML = matches.map((t) => `
      <button class="sr-row" data-id="${t.id}">
        <span class="sr-badge">${UI.catBadge(t.category)}</span>
        <span class="sr-main">
          <span class="sr-title">${mark(t.title, q)}</span>
          <span class="sr-snippet">${mark(snippet(t.body, q), q)}</span>
        </span>
      </button>`).join("");

    out.querySelectorAll(".sr-row").forEach((row) => {
      row.addEventListener("click", () => {
        // Search spans ALL tips, but the Deck is category-filtered. Focus the Deck
        // on this tip's category so the jump always lands on it (not a stale filter).
        const tip = Content.tipById(row.dataset.id);
        if (tip) App.setFilter([tip.category]);
        App.setDeckTo(row.dataset.id);
        App.navigate("deck");
      });
    });
  }

  input.addEventListener("input", draw);
  // Dev-only prefill (BEARINGS_SEARCH_Q); no-op in normal use.
  App.devSearchQuery(function (q) {
    if (q) input.value = q;
    draw();
    setTimeout(() => input.focus(), 30);
  });
};
