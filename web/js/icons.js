/* Inline SVG icons. Line icons use stroke=currentColor so they inherit color.
   The compass mark is the app's signature: a tick-marked ring with a needle. */
window.ICONS = (function () {
  // Signature compass mark. `glow` adds the soft ambient halo used in-app.
  function compass(size, glow) {
    const s = size || 38;
    return `
    <svg class="compass" width="${s}" height="${s}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Bearings compass mark">
      ${glow ? '<circle cx="24" cy="24" r="20" fill="#6C4FE0" opacity="0.20"/>' : ''}
      <circle cx="24" cy="24" r="19" stroke="#9C86FF" stroke-width="2"/>
      <g stroke="#9C86FF" stroke-width="1.6" stroke-linecap="round" opacity="0.8">
        <line x1="24" y1="4"  x2="24" y2="9"/>
        <line x1="24" y1="39" x2="24" y2="44"/>
        <line x1="4"  y1="24" x2="9"  y2="24"/>
        <line x1="39" y1="24" x2="44" y2="24"/>
      </g>
      <g stroke="#9C86FF" stroke-width="1.1" stroke-linecap="round" opacity="0.5">
        <line x1="10" y1="10" x2="13" y2="13"/>
        <line x1="38" y1="10" x2="35" y2="13"/>
        <line x1="10" y1="38" x2="13" y2="35"/>
        <line x1="38" y1="38" x2="35" y2="35"/>
      </g>
      <!-- needle -->
      <path d="M24 11 L28 24 L24 22 L20 24 Z" fill="#6C4FE0"/>
      <path d="M24 37 L20 24 L24 26 L28 24 Z" fill="#E8B04B"/>
      <circle cx="24" cy="24" r="2.4" fill="#F1EDFB"/>
    </svg>`;
  }

  const line = (paths) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

  return {
    compass,
    home: () => line('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>'),
    lookup: () => line('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 4v16"/>'),
    deck: () => line('<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M3.5 7v10M20.5 7v10"/>'),
    checklist: () => line('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'),
    search: () => line('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>'),
    cheatsheet: () => line('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
    settings: () => line('<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
    about: () => line('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>'),
    bookmark: (filled) => filled
      ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>'
      : line('<path d="M6 3h12v18l-6-4-6 4z"/>'),
    arrowLeft: () => line('<path d="M15 5l-7 7 7 7"/>'),
    arrowRight: () => line('<path d="M9 5l7 7-7 7"/>'),
    lock: () => line('<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
    check: () => line('<path d="M4 12l5 5L20 6"/>'),
    verified: () => '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 1.8 3-.2 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.2L12 22l-2.4-1.8-3 .2-1-2.8L3 16.3l.9-2.9L3 10.5l2.6-1.5 1-2.8 3 .2z"/><path d="M8.5 12.2l2.3 2.3 4.5-4.7" fill="none" stroke="#15101F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    external: () => line('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),
    mail: () => line('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
    youtube: () => line('<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M11 9.5l4 2.5-4 2.5z" fill="currentColor" stroke="none"/>'),
    telegram: () => line('<path d="M21 4L3 11l5 2 2 6 3-4 4 3z"/><path d="M8 13l8-6"/>'),
    github: () => '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>',
    globe: () => line('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18"/>'),
    coffee: () => line('<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 9h2a2 2 0 0 1 0 4h-2"/><path d="M8 2v2M12 2v2"/>'),
    print: () => line('<path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="8" rx="1"/><path d="M7 14h10v6H7z"/>'),
  };
})();
