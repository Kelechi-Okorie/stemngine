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
  gap: var(--space);
}

.column {
  display: flex;
  flex-direction: column;
}

.padded { padding: var(--space);}

/*
  internal layout (flex-based)
  - panels
  - inspector sections
  - dynamic layouts
*/
.fill {
  flex: 1;
}

.flex-1 {
  flex: 1;
}

.flex-2 {
  flex: 2;
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-y {
  display: flex;
  align-items: center; /* vertical centering */

}

.text {
  color: var(--text);
  font-family: var(--font-family);
}

.full {
  width: 100%;
  height: 100%;
}

/* TODO: to be removed */
.width {
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
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* layering (z system) */
.z-0 { z-index: var(--layer-0);}
.z-1 { z-index: var(--layer-1);}
.z-2 { z-index: var(--layer-2);}
.z-3 { z-index: var(--layer-3);}

.mb-sm {padding-bottom: var(--space-sm);}
`;

export default textContent;
