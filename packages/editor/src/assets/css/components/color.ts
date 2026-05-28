const textContent = `
.color-swatch {
  width: 28px;
  height: 16px;

  border: 1px solid var(--border);
  border-radius: var(--radius);

  background: var(--panel-2);

  cursor: pointer;

  position: relative;
  overflow: hidden;
}

/* subble hover */
.color-swatch:hover {
  border-color: var(--text);
}

.color-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}
`;

export default textContent;
