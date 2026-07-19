/* First-run onboarding: a single centered glass card over the ambient glow.
   Two questions — where you're coming from (single-select) and what you'll use
   it for (multi-select; Universal is locked on). Both are saved to local state
   and changeable later in Settings. Committing lands on Lookup. */
window.Onboarding = (function () {
  const PLATFORMS = ["Windows", "Mac", "ChromeOS"];

  let platform = null;
  const chosen = new Set();   // selected territory categories

  function glowMarkup() {
    return `<div id="glow" aria-hidden="true">
      <div class="orb orb-tl"></div><div class="orb orb-br"></div><div class="orb orb-c"></div>
    </div>`;
  }

  function render(root) {
    platform = null;
    chosen.clear();

    const platformPills = PLATFORMS.map(
      (p) => `<button class="chip ob-platform" data-platform="${p}">${p}</button>`
    ).join("");

    const territoryChips = Content.territories().map((c) =>
      `<button class="chip ob-cat" data-cat="${c.key}">${c.label}</button>`
    ).join("");

    root.innerHTML = `
      ${glowMarkup()}
      <div class="ob-wrap">
        <div class="ob-card glass">
          <div class="ob-brand">
            ${ICONS.compass(46, true)}
            <span class="wordmark">
              <span class="wm-main" style="font-size:1.7rem">Bearings</span>
              <span class="wm-sub">by Kamsiob</span>
            </span>
          </div>
          <p class="ob-intro">A field guide for finding your footing on Bazzite. Two quick questions, then straight to what works.</p>

          <div class="ob-q">
            <div class="mono-label">Where are you coming from?</div>
            <div class="ob-row">${platformPills}</div>
          </div>

          <div class="ob-q">
            <div class="mono-label">What will you use it for?</div>
            <div class="ob-row">
              <span class="chip locked selected ob-universal" title="Always included">
                <span class="ni-icon" style="width:15px;height:15px">${ICONS.lock()}</span> Universal
              </span>
              ${territoryChips}
            </div>
          </div>

          <div class="ob-foot">
            <p class="ob-privacy">Nothing you enter here leaves this device.</p>
            <button class="btn btn-primary ob-commit" disabled>Show me what works</button>
          </div>
        </div>
      </div>`;

    root.querySelectorAll(".ob-platform").forEach((btn) => {
      btn.addEventListener("click", () => {
        platform = btn.dataset.platform;
        root.querySelectorAll(".ob-platform").forEach((b) =>
          b.classList.toggle("selected", b === btn));
        updateCommit(root);
      });
    });

    root.querySelectorAll(".ob-cat").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.cat;
        if (chosen.has(cat)) chosen.delete(cat); else chosen.add(cat);
        btn.classList.toggle("selected", chosen.has(cat));
      });
    });

    root.querySelector(".ob-commit").addEventListener("click", () => commit());
  }

  function updateCommit(root) {
    root.querySelector(".ob-commit").disabled = !platform;
  }

  function commit() {
    const categories = ["universal", ...Array.from(chosen)];
    State.update({ onboarded: true, platform: platform, categories: categories });
    App.enterMainShell("lookup");   // onboarding always lands on Lookup
  }

  return { render };
})();
