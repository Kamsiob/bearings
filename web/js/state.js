/* State store — the single source of truth for user preferences and progress.
   Loads once from the Python backend at boot, writes back on every change.
   The backend owns where it lives on disk; JS just hands it a JSON blob. */
window.State = (function () {
  const DEFAULTS = {
    onboarded: false,
    platform: null,                 // "Windows" | "Mac" | "ChromeOS"
    categories: ["universal"],      // universal is always present, never removable
    checklist: {},                  // { [tipId]: true }  -> checked
    bookmarks: {},                  // { [tipId]: true }  -> saved to personal list
    updateAutoCheck: false,         // opt-in: check for content updates on launch
    lastChecked: null,              // ISO timestamp of last update check
    contentVersion: null,           // version string of cached content
  };

  let data = Object.assign({}, DEFAULTS);
  let backend = null;
  const listeners = [];

  function normalize(s) {
    const out = Object.assign({}, DEFAULTS, s || {});
    if (!Array.isArray(out.categories)) out.categories = ["universal"];
    if (!out.categories.includes("universal")) out.categories.unshift("universal");
    out.checklist = out.checklist || {};
    out.bookmarks = out.bookmarks || {};
    return out;
  }

  return {
    init(be, raw) {
      backend = be;
      data = normalize(raw);
      return data;
    },
    all() { return data; },
    get(key) { return data[key]; },
    set(key, value) {
      data[key] = value;
      this.save();
      this._emit();
    },
    update(patch) {
      Object.assign(data, patch);
      this.save();
      this._emit();
    },
    save() {
      if (backend && backend.save_state) backend.save_state(JSON.stringify(data));
    },
    // Category selection (universal is locked on).
    toggleCategory(cat) {
      if (cat === "universal") return;
      const set = new Set(data.categories);
      if (set.has(cat)) set.delete(cat); else set.add(cat);
      set.add("universal");
      data.categories = Array.from(set);
      this.save();
      this._emit();
    },
    hasCategory(cat) { return data.categories.includes(cat); },
    // Bookmarks & checklist helpers.
    toggleBookmark(id) {
      id = String(id);
      if (data.bookmarks[id]) delete data.bookmarks[id];
      else data.bookmarks[id] = true;
      this.save();
      this._emit();
    },
    isBookmarked(id) { return !!data.bookmarks[String(id)]; },
    toggleChecked(id) {
      id = String(id);
      if (data.checklist[id]) delete data.checklist[id];
      else data.checklist[id] = true;
      this.save();
      this._emit();
    },
    isChecked(id) { return !!data.checklist[String(id)]; },
    // Change subscriptions (screens re-render when relevant state changes).
    onChange(fn) { listeners.push(fn); },
    _emit() { listeners.forEach((fn) => { try { fn(data); } catch (e) { console.error(e); } }); },
  };
})();
