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

const textContent = `
/* =========================
  THEME: DARK
========================= */
:host([data-theme="dark"]) {

  /* Surfaces */
  --bg: #0b0f14;
  --panel: #121821;
  --panel-2: #0f141c;
  --panel-3: #0c1117;

  /* Content */
  --text: #e6edf3;
  --muted: #9aa4af;

  /* Actions */
  --accent: #3b82f6;
  --accent-2: #22c55e;
  
  /* Borders */
  --border: rgba(255,255,255,0.06);

  /* Interaction overlay */
  --hover-overlay:rgba(255,255,255,0.05);
  --active-overlay: rgba(0,0,0,0.25);
  --focus-ring: 1px solid rgba(59,130,246,0.9);
  --focus-border: 1px solid var(--accent);

  /* state */
  --selection-bg: rgba(59,130,246,0.2);
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
  --text: 11px;
  --text-sm: 12px;
  --text-md: 13px;
  --text-lg: 14px;

  /* spacing */
  --space: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;

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
