const textContent = `
.li {
  background: var(--panel-2);
  color: var(--text);
  padding: var(--space) var(--space);
  border-radius: var(--radius-xs);
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease;
}

.li:active {
    background: color-mix(in srgb, var(--panel), var(--active-overlay));
}

.li:focus {
    outline: none;
    /* box-shadow: var(--focus-ring); */
    border-color: var(--accent);
    background: color-mix(in srgb, var(--panel), var(--hover-overlay));
}

.li:hover {
    background: color-mix(in srgb, var(--panel), var(--hover-overlay));
}
`;

export default textContent;
