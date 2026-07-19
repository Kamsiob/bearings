/* Home — a returning-user landing page, not a getting-started splash. */
Screens.home = function (el) {
  const tips = Content.tips();
  const featured = tips.length ? tips[UI.dailyIndex(tips.length)] : null;

  const territories = Content.territories().map((c) => {
    const n = Content.countByCategory(c.key);
    return `<button class="terr-row" data-cat="${c.key}">
        <span class="terr-name">${UI.catDot(c.key)}${UI.esc(c.label)}</span>
        <span class="terr-count">${n}</span>
      </button>`;
  }).join("");

  const featuredCard = featured ? `
    <div class="terr-note">${UI.catBadge(featured.category)}
      <span class="tag-label" style="margin-left:8px">${UI.esc(featured.tag)}</span></div>
    <h3 class="bearing-title">${UI.esc(featured.title)}</h3>
    <p class="bearing-body">${UI.esc(featured.body)}</p>
    <button class="link-btn" data-act="open-deck">Open the deck →</button>`
    : `<p class="bearing-body">Content is loading.</p>`;

  el.innerHTML = `
    <div class="screen">
      <div class="screen-head">
        <h1>Good to see you back</h1>
        <p class="sub">Your reference for living on Bazzite — not just getting started.</p>
      </div>

      <div class="home-grid">
        <section class="glass home-featured">
          <div class="mono-label">Today's bearing</div>
          ${featuredCard}
        </section>

        <section class="glass home-territories">
          <div class="mono-label">Your territories</div>
          <div class="terr-list">${territories}</div>
        </section>
      </div>

      <div class="home-tiles">
        <button class="glass tile" data-act="lookup">
          <span class="tile-icon">${ICONS.lookup()}</span>
          <span class="tile-label">Lookup</span>
          <span class="tile-sub">Find your app's equivalent</span>
        </button>
        <button class="glass tile" data-act="checklist">
          <span class="tile-icon">${ICONS.checklist()}</span>
          <span class="tile-label">Checklist</span>
          <span class="tile-sub">Track what you've learned</span>
        </button>
        <button class="glass tile" data-act="search">
          <span class="tile-icon">${ICONS.search()}</span>
          <span class="tile-label">Search</span>
          <span class="tile-sub">Jump to any tip</span>
        </button>
        <button class="glass tile tile-gamer" data-act="gamer">
          <span class="tile-icon">${ICONS.deck()}</span>
          <span class="tile-label">Gamer picks</span>
          <span class="tile-sub">Straight to the gaming deck</span>
        </button>
      </div>
    </div>`;

  // Territory click: focus the Deck + Checklist on that category, go to Deck.
  el.querySelectorAll(".terr-row").forEach((btn) => {
    btn.addEventListener("click", () => {
      App.setFilter(["universal", btn.dataset.cat]);
      App.navigate("deck");
    });
  });

  el.querySelector('[data-act="open-deck"]')?.addEventListener("click", () => {
    if (featured) App.setDeckTo(featured.id);
    App.navigate("deck");
  });

  const go = { lookup: "lookup", checklist: "checklist", search: "search" };
  Object.keys(go).forEach((act) => {
    el.querySelector(`[data-act="${act}"]`)?.addEventListener("click", () => App.navigate(go[act]));
  });

  // Gamer picks: add Gamer to the active filter, jump to the Deck.
  el.querySelector('[data-act="gamer"]')?.addEventListener("click", () => {
    App.addToFilter("gamer");
    App.navigate("deck");
  });
};
