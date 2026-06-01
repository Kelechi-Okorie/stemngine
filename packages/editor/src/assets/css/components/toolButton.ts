const textContent = `
.tool-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background: inherit;
  width: 32px;
  height: 32px;
  border: none;
  color: var(--text);
  padding: 4px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s ease;
}

.tool-button:hover {
  background: var(--accent-soft);
}

.tool-button svg {
  stroke: currentColor;
  fill: none;
  width: 20px;
  height: 20px;
}
`;

export default textContent;
