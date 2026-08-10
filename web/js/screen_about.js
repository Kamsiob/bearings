/* About — what Bearings is (an ongoing reference, never beginner-only), the
   promises it keeps, external links, a feedback mailto, and the version block.

   The version block is the app's only self-initiated network capability, and it
   is initiated by a press, never by the app: at rest it shows the version this
   copy already knows about itself, locally, and does nothing at all. It is a
   separate thing from the content update in Settings (which refreshes the tips)
   and the copy on both sides says so. */
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

      <section class="glass about-version">
        <div class="mono-label">App version</div>
        <p class="av-have">You have version <b id="av-current">${UI.esc(__APP_VERSION__())}</b>.</p>
        <div class="av-row">
          <button class="btn btn-primary av-check" data-act="check-version">Check for a newer version</button>
        </div>
        <div class="av-result" id="av-result" hidden></div>
        <p class="av-note">
          Nothing here goes online until you press that button, and it's the only reason this
          screen ever would. Nothing about you or your device is sent, but as with any web request,
          your address is visible to GitHub for that one check. (Updating the <i>tips</i> is a
          separate thing, over in Settings.)
        </p>
      </section>

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

      <div class="about-legal">
        <p class="about-foot">Bearings v<span id="about-ver">${UI.esc(__APP_VERSION__())}</span> · AGPLv3 licensed</p>
        <p class="about-notice">© 2026 Kamsiob. It comes with absolutely no warranty —
          <a class="about-license-link" data-url="https://github.com/kamsiob/bearings/blob/main/LICENSE">read the full license</a>.</p>
      </div>
    </div>`;

  el.querySelectorAll("[data-url]").forEach((btn) =>
    btn.addEventListener("click", () => open(btn.dataset.url)));

  // Version comes from Python (single source).
  if (window.backendRef && backendRef.app_version) {
    backendRef.app_version(function (v) {
      const node = el.querySelector("#about-ver");
      const have = el.querySelector("#av-current");
      if (node && v) node.textContent = v;
      if (have && v) have.textContent = v;
    });
  }

  /* --- the version check ------------------------------------------------- */
  const btn = el.querySelector('[data-act="check-version"]');
  const out = el.querySelector("#av-result");
  let install = "unknown";   // filled in locally, no network
  let checking = false;
  let timer = null;

  // How this copy was installed decides what we tell them to do about an
  // update. This is a local question; it makes no request.
  if (window.backendRef && backendRef.install_kind) {
    backendRef.install_kind(function (kind) { if (kind) install = kind; });
  }

  function show(html, tone) {
    if (!out || !document.body.contains(out)) return;
    out.className = "av-result" + (tone ? " av-" + tone : "");
    out.innerHTML = html;
    out.hidden = false;
    out.querySelectorAll("[data-url]").forEach((b) =>
      b.addEventListener("click", () => open(b.dataset.url)));
  }

  function settle() {
    checking = false;
    if (timer) { clearTimeout(timer); timer = null; }
    if (btn && document.body.contains(btn)) {
      btn.disabled = false;
      btn.textContent = "Check again";
    }
  }

  // What to do about a newer version, which depends entirely on how they got
  // this copy. A Flatpak is the system's to update, never ours.
  function howToGetIt(r) {
    const url = r.releasesUrl || "https://github.com/Kamsiob/bearings/releases/latest";
    if (r.install === "flatpak") {
      return `<p class="av-how">Update it through your app store (Discover or Bazaar),
        or run <code>flatpak update</code>.</p>`;
    }
    const openRow = `<button class="btn av-open" data-url="${UI.esc(url)}">
        Open the releases page <span class="ni-icon">${ICONS.external()}</span></button>`;
    if (r.install === "appimage") {
      return openRow + `<p class="av-how">Download the new one there. If you'd rather not do
        this by hand again, a free tool called GearLever can manage AppImage updates for you,
        keeping one copy rather than a pile of them.</p>`;
    }
    return openRow + `<p class="av-how">Download the new one there whenever you feel like it.</p>`;
  }

  function render(r) {
    settle();
    if (!r || !r.ok) {
      show(`<p class="av-line">Couldn't check right now. Try again later.</p>`, "quiet");
      return;
    }
    if (r.newer) {
      show(`<p class="av-line"><b>You have ${UI.esc(r.current)}. Version
        ${UI.esc(r.latest)} is available.</b></p>` + howToGetIt(r), "new");
      return;
    }
    show(`<p class="av-line">You're on the latest version.</p>`, "ok");
  }

  // The result arrives on a Python signal; App routes it here while About is up.
  App.setReleaseHandler(function (r) {
    if (!checking) return;
    render(r);
  });

  btn?.addEventListener("click", () => {
    if (checking) return;
    if (!window.backendRef || !backendRef.check_app_version) {
      render({ ok: false });
      return;
    }
    checking = true;
    btn.disabled = true;
    btn.textContent = "Checking…";
    if (out) out.hidden = true;
    // Python gives up after 8s; this is the backstop so the button can never sit
    // spinning forever if the bridge itself goes quiet.
    timer = setTimeout(() => { if (checking) render({ ok: false }); }, 15000);
    backendRef.check_app_version();
  });
};

// Fallback used before the async version arrives.
function __APP_VERSION__() { return "1.1.0"; }
