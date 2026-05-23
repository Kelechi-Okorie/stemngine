const textContent = `
.button {
  background: var(--panel-2);
  color: var(--text);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-xs);
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease;
}

.button:active {
    background: color-mix(in srgb, var(--panel), var(--active-overlay));
}

.button:focus {
    outline: none;
    /* box-shadow: var(--focus-ring); */
    border-color: var(--accent);
    background: color-mix(in srgb, var(--panel), var(--hover-overlay));
}

.button:hover {
    background: color-mix(in srgb, var(--panel), var(--hover-overlay));
}
`;

export default textContent;
