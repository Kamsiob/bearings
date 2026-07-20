/* About — what Bearings is (an ongoing reference, never beginner-only), the
   promises it keeps, external links, and a feedback mailto. */
Screens.about = function (el) {
  const links = [
    { icon: "youtube",  title: "Kamsiob on Linux", url: "https://youtube.com/@kamsiob",       label: "youtube.com/@kamsiob" },
    { icon: "github",   title: "Source code",      url: "https://github.com/kamsiob",         label: "github.com/kamsiob" },
    { icon: "globe",    title: "Website",          url: "https://kamsiob.com",                label: "kamsiob.com" },
    { icon: "telegram", title: "Kamsiob Lab",      url: "https://t.me/+g5LKm9rUnNcxMjk5",      label: "Our community group on Telegram" },
  ];

  function open(url) {
    if (window.backendRef && backendRef.open_url) backendRef.open_url(url);
  }

  const linkRows = links.map((l) => `
    <button class="about-link" data-url="${l.url}">
      <span class="about-link-icon">${ICONS[l.icon]()}</span>
      <span class="about-link-text">
        <span class="about-link-title">${UI.esc(l.title)}</span>
        <span class="about-link-url">${UI.esc(l.label)}</span>
      </span>
      <span class="about-link-ext">${ICONS.external()}</span>
    </button>`).join("");

  el.innerHTML = `
    <div class="screen about-screen">
      <div class="about-brand">
        ${ICONS.compass(56, true)}
        <span class="wordmark">
          <span class="wm-main" style="font-size:2rem">Bearings</span>
          <span class="wm-sub" style="font-size:0.85rem">by Kamsiob</span>
        </span>
      </div>

      <p class="about-desc">
        A living reference for Bazzite — the things worth knowing when you're new,
        and the things worth keeping around long after you're not.
      </p>

      <div class="glass about-callout">
        <p><b>Zero data collection.</b> Everything runs locally on your machine. No accounts, no
        telemetry, no analytics — nothing phones home. Free and open source under the GNU AGPLv3 license.</p>
        <p class="about-callout-coffee">It's free, and it stays free — no paywall, nothing ever gated
        behind payment. If it's helped you find your footing, you can
        <a class="coffee-link" data-url="https://buymeacoffee.com/kamsiob">
          <span class="coffee-icon">${ICONS.coffee()}</span>buy me a coffee</a> — only if you feel like it.</p>
      </div>

      <div class="about-more">
        <div class="mono-label">Find more</div>
        <div class="about-links">${linkRows}</div>
        <button class="about-feedback" data-url="mailto:hello@kamsiob.com">
          <span class="about-link-icon">${ICONS.mail()}</span>
          <span class="about-link-text">
            <span class="about-link-title">Questions or feedback</span>
            <span class="about-link-url">hello@kamsiob.com</span>
          </span>
          <span class="about-link-ext">${ICONS.mail()}</span>
        </button>
      </div>

      <p class="about-foot">Bearings v<span id="about-ver">${UI.esc(__APP_VERSION__())}</span> · AGPLv3 licensed</p>
    </div>`;

  el.querySelectorAll("[data-url]").forEach((btn) =>
    btn.addEventListener("click", () => open(btn.dataset.url)));

  // Version comes from Python (single source).
  if (window.backendRef && backendRef.app_version) {
    backendRef.app_version(function (v) {
      const node = el.querySelector("#about-ver");
      if (node && v) node.textContent = v;
    });
  }
};

// Fallback used before the async version arrives.
function __APP_VERSION__() { return "1.0.0"; }
