const textContent = `
.checkbox {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-neutral-1);
  background: var(--panel-2);
  border-radius: var(--radius);
  display: inline-grid;
  place-content: center;
  /* position: relative; */
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}

.checkbox:hover {
  border-color: var(--text);
}

.checkbox:checked {
  background: var(--color-neutral-1);
  border-color: var(--color-neutral-1);
}

.checkbox:checked::after {
  /* content: ""; */
  width: 6px;
  height: 3px;

  border-left: 2px solid white;
  border-bottom: 2px solidi white;

  /* transform: rotate(-45deg) translateY(-1px); */
  /* position: absolute; */
  /* inset: 0; */
  /* background: white; */
}
`;

export default textContent;
