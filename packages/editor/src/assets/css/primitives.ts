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
  gap: var(--space-md);
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
`;

export default textContent;
