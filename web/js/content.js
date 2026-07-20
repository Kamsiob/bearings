/* Content module — category/tag vocabulary and the loaded content store.
   The actual tips + lookup table are loaded from content.json (via the backend)
   and filled in from Phase 7 onward. This file owns the fixed vocabulary. */
window.Content = (function () {
  // Ordered, closed list. Universal is always-on and never a "territory".
  const CATEGORIES = [
    { key: "universal",    label: "Universal",              var: "--cat-universal",    territory: false },
    { key: "productivity", label: "Productivity",           var: "--cat-productivity", territory: true },
    { key: "creator",      label: "Creator",                var: "--cat-creator",      territory: true },
    { key: "gamer",        label: "Gamer",                  var: "--cat-gamer",        territory: true },
    { key: "coder",        label: "Coder",                  var: "--cat-coder",        territory: true },
    { key: "privacy",      label: "Privacy & Self-Hosting", var: "--cat-privacy",      territory: true },
  ];
  // Closed tag vocabulary — never invent new tags.
  const TAGS = ["Concept", "Trick", "Fix", "Gotcha", "Reassurance", "Habit"];

  const byKey = {};
  CATEGORIES.forEach((c) => { byKey[c.key] = c; });

  let store = { version: null, tips: [], lookup: [] };

  return {
    CATEGORIES,
    TAGS,
    territories() { return CATEGORIES.filter((c) => c.territory); },
    cat(key) { return byKey[key] || { key, label: key, var: "--cat-universal" }; },
    catLabel(key) { return (byKey[key] || {}).label || key; },

    load(json) {
      if (json && typeof json === "object") {
        store = {
          version: json.version || null,
          tips: Array.isArray(json.tips) ? json.tips : [],
          lookup: Array.isArray(json.lookup) ? json.lookup : [],
        };
      }
      return store;
    },
    version() { return store.version; },
    tips() { return store.tips; },
    lookup() { return store.lookup; },
    tipById(id) { return store.tips.find((t) => String(t.id) === String(id)); },
    // Tips filtered to exactly the given category keys, in each category's
    // natural order (selected topics lead, universal no longer forced in — the
    // default view already includes universal via the user's saved categories).
    tipsFor(activeCats) {
      const wanted = (activeCats && activeCats.length) ? activeCats : CATEGORIES.map((c) => c.key);
      const order = {};
      wanted.forEach((k, i) => { order[k] = i; });
      return store.tips
        .filter((t) => order.hasOwnProperty(t.category))
        .sort((a, b) => (order[a.category] - order[b.category]) || (a.id - b.id));
    },
    countByCategory(key) { return store.tips.filter((t) => t.category === key).length; },
  };
})();
