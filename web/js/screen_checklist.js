/* Checklist — the full tip list grouped by category into glass cards, each with
   a header (icon + label + progress) and checkable rows. A checked row fills its
   checkbox with the category color and strikes through. Progress persists. */
Screens.checklist = function (el) {
  const cats = App.getFilter();
  const active = (cats && cats.length) ? cats : Content.CATEGORIES.map((c) => c.key);
  const groups = Content.CATEGORIES
    .map((c) => ({ cat: c, tips: Content.tips().filter((t) => t.category === c.key) }))
    .filter((g) => g.tips.length && active.includes(g.cat.key));

  const totalAll = groups.reduce((n, g) => n + g.tips.length, 0);

  function checkedIn(tips) { return tips.filter((t) => State.isChecked(t.id)).length; }

  function cardHtml(g) {
    const done = checkedIn(g.tips);
    const pct = g.tips.length ? Math.round((done / g.tips.length) * 100) : 0;
    const rows = g.tips.map((t) => {
      const on = State.isChecked(t.id);
      return `<button class="cl-row${on ? " done" : ""}" data-id="${t.id}" data-cat="${g.cat.key}">
          <span class="cl-box" style="--cat: var(${g.cat.var})">${ICONS.check()}</span>
          <span class="cl-text">${UI.esc(t.title)}</span>
        </button>`;
    }).join("");
    return `<section class="glass cl-card" data-cat="${g.cat.key}">
        <header class="cl-card-head">
          <span class="cl-cat">${UI.catIcon(g.cat.key)}<span class="cl-cat-label">${UI.esc(g.cat.label)}</span></span>
          <span class="cl-count mono-label"><span class="cl-done">${done}</span> of ${g.tips.length}</span>
        </header>
        <div class="cl-bar"><span class="cl-bar-fill" style="width:${pct}%;background:var(${g.cat.var})"></span></div>
        <div class="cl-rows">${rows}</div>
      </section>`;
  }

  const doneAll = groups.reduce((n, g) => n + checkedIn(g.tips), 0);

  el.innerHTML = `
    <div class="screen">
      <div class="screen-head cl-head">
        <div>
          <h1>Checklist</h1>
          <p class="sub">Everything worth knowing, grouped — check off what's landed.</p>
        </div>
        <div class="cl-overall">
          <div class="mono-label"><span id="cl-overall-done">${doneAll}</span> of ${totalAll} done</div>
          <div class="cl-bar cl-bar-lg"><span class="cl-bar-fill" id="cl-overall-fill"
            style="width:${totalAll ? Math.round((doneAll / totalAll) * 100) : 0}%;background:var(--primary)"></span></div>
        </div>
      </div>
      <div class="cl-grid">${groups.map(cardHtml).join("")}</div>
    </div>`;

  // Toggle a row: update state + the row, its card header, and the overall bar.
  el.querySelectorAll(".cl-row").forEach((row) => {
    row.addEventListener("click", () => {
      const id = row.dataset.id;
      State.toggleChecked(id);
      row.classList.toggle("done", State.isChecked(id));
      refreshCard(row.closest(".cl-card"));
      refreshOverall();
    });
  });

  function refreshCard(card) {
    const rows = card.querySelectorAll(".cl-row");
    const done = Array.from(rows).filter((r) => r.classList.contains("done")).length;
    card.querySelector(".cl-done").textContent = done;
    const pct = rows.length ? Math.round((done / rows.length) * 100) : 0;
    card.querySelector(".cl-bar-fill").style.width = pct + "%";
  }

  function refreshOverall() {
    const done = el.querySelectorAll(".cl-row.done").length;
    el.querySelector("#cl-overall-done").textContent = done;
    el.querySelector("#cl-overall-fill").style.width =
      (totalAll ? Math.round((done / totalAll) * 100) : 0) + "%";
  }
};
