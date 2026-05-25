const textContent = `
.tool-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg);
  width: 32px;
  height: 32px;
  border: none;
  color: var(--text);
  padding: 4px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s ease;
}

.tool-button:active {
    background: color-mix(in srgb, var(--panel), var(--active-overlay));
}

.tool-button:focus {
    outline: none;
    /* box-shadow: var(--focus-ring); */
    border-color: var(--accent);
    background: color-mix(in srgb, var(--panel), var(--hover-overlay));
}

.tool-button:hover {
    background: color-mix(in srgb, var(--panel), var(--hover-overlay));
}

.tool-button svg {
  stroke: currentColor;
  fill: none;
  width: 20px;
  height: 20px;
}
`;

export default textContent;
