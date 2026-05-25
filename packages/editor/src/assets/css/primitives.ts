// PRIMITIVES layer = “geometry system”
// This is where structure begins.
// Primitives define:
// layout rules
// alignment
// spacing behavior
// reusable patterns
// Philosophy:

// Primitives define how things relate spatially
// Think:
// vectors
// grids
// coordinate systems
// Example:
// .row { display: flex; gap: var(--space-md); }
// .column { display: flex; flex-direction: column; }
// .fill { flex: 1; }
// .center { display: flex; align-items: center; justify-content: center; }

// These are NOT UI elements.
// They are composition tools.

const textContent = `
.row {
  display: flex;
  flex-direction: row;
  gap: var(--space-md);
}

.column {
  display: flex;
  flex-direction: column;
  gap: var(--space);
}

/*
  internal layout (flex-based)
  - panels
  - inspector sections
  - dynamic layouts
*/
.fill {
  flex: 1;
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.text {
  color: var(--text);
  font-family: var(--font-family);
}

.full {
  width: 100%;
  height: 100%;
}

width {
  width: var(--width);
}

/* positioning primitives */
.absolute { position: absolute; }

.relative { position: relative; }

.fixed { position: fixed; }

.inset-0 {
  top: 0; right: 0; bottom: 0; left: 0;
}

/* Centering in Coordinate Space */
.center-xy {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* layering (z system) */
.z-modal { z-index: 200; }

.z-overlay { z-index: 100; }

/* Overlay Primitive (Very Important for Modals) */
.overlay {
  position: absolute;
  inset: 0;
  /* background: rgba(0,0,0,0.5); */
}

/* Surface Primitive */
.surface {
  background: var(--panel);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-md);
}
`;

export default textContent;
