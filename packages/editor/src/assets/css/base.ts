// Design tokens (YES)
// colors
// spacing
// radius
// typography
// elevation
// motion

// Nothing visual is defined yet — only meaning.

// surfaces
// content
// actions
// borders
// interaction

/**
 * Need 3 layers:
 * 1. base palette (raw colors)
 * 2. derived colors (with opacity / blending)
 * 3. semantic tokens (what they mean)
 */

const textContent = `
/* =========================
  THEME: DARK
========================= */
:host([data-theme="dark"]) {

  /* base palette (raw) */
  --color-bg-base: #28292E;
  --color-neutral-1: #ADAFB8;
  --color-neutral-2: #BBBCC4;
  --color-neutral-3: #D6D7DB;

  /* Derived (alpha/opacity variants) color + opacity states */
  --neutral-2-10: rgba(187, 188, 196, 0.10);  /* #BBBCC4 10% */
  --neutral-2-15: rgba(187, 188, 196, 0.15);  /* #BBBCC4 15% */
  --neutral-2-20: rgba(187, 188, 196, 0.20);  /* #BBBCC4 20% */
  --neutral-2-25: rgba(187, 188, 196, 0.25);  /* #BBBCC4 25% */
  --neutral-2-70: rgba(187, 188, 196, 0.70);  /* #BBBCC4 70% */

  /* Surfaces */

  /* Content */
  --text: #e6edf3;
  --text-neutral-2-70: var(--neutral-2-70);
  --muted: #9aa4af;

  /* Actions */
  --accent: #22d3ee;
  --accent-strong: #06b6d4;
  --accent-soft: rgba(34, 211, 238, 0.2);

  
  /* Borders */
  --border: rgba(255,255,255,0.06);

  /* Interaction overlay */
  --hover-overlay:rgba(255,255,255,0.05);
  --active-overlay: rgba(0,0,0,0.25);
  --focus-ring: 1px solid var(--accent);
  --focus-glow: 0 0 0 2px var(--accent-soft);
  --focus-border: 1px solid var(--accent);

  /* state */
  --selection-bg: var(--accent-soft);
  --state-active: var(--accent);
  --state-hover: var(--overlay-hover);
  --state-focus-bg: var(--overlay-accent-soft);
  --state-pressed-bg: var(--overlay-active);
  --state-highlight: var(--accent-strong);
  --disabled-opacity: 0.45;
  --disabled-overlay: rgba(255,255,255,0.15);

}

/* =========================
  THEME: LIGHT
========================= */
:host([data-theme="light"]) {

  /* Surfaces */
  --bg: #ffffff;
  --panel: #f6f7f9;
  --panel-2: #eef0f3;
  --panel-3: #e5e7eb;

  /* Content */
  --text: #111827;
  --muted: #6b7280;

  /* Actions */
  --accent: #2563eb;
  --accent-2: #16a34a;

  /* Borders */
  --border: rgba(0,0,0,0.08);

  /* Interaction */
  --hover-overlay: rgba(0,0,0,0.04);
  --active-overlay: rgba(0,0,0,0.08);
  --focus-ring: 0 0 0 2px rgba(37,99,235,0.5);

  --selection-bg: rgba(37,99,235,0.15);
  --disabled-overlay: rgba(0,0,0,0.08);
}

/* =========================
  BASE (non-theme tokens)
========================= */
:host {
  display: block;
  width: 100%;
  height: 100%;

  /* typography */
  --font-family: Inter, sans-serif;
  --font-size: 11px;
  --font-size-sm: 12px;
  --font-size-md: 13px;
  --font-size-lg: 14px;

  /* spacing */
  --space: 2px;
  --space-sm: 4px;
  --space-md: 8px;
  --space-lg: 12px;

  /* radius */
  --radius: 2px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* motion */
  --transition: 0.18s ease;
  --transition-fast: 0.12s ease;
  --transition-slow: 0.3s ease;

  /* elevation */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 10px rgba(0,0,0,0.3);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.5);

  /* semantic */
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;


  --bp-sm: 600px;
  --bp-md: 900px;
  --bp-lg: 1200px;

  --layer-0: 0;
  --layer-1: 100;
  --layer-2: 200;
  --layer-3: 300;

  --width: 260px;

}

/* =========================
  RESET
========================= */
/* TODO: ask if this is correct or to use * inside shadow */
*, *::before, *::after {
  box-sizing: border-box;
}
`;

export default textContent;
