const textContent = `
.select {
  width: 100%;
  box-sizing: border-box;

  background: var(--panel-2);
  color: var(--text);

  border: 1px solid var(--border);
  border-radius: var(--radius);

  padding: 2px  6px;
  font-family: var(--font-family);
  font-size: var(--font-size);

  outline: none;

  cursor: pointer;
}

.select:hover {
  border-color: var(--accent-soft);
}

.select:focus {
  border-color: var(--color-neutral-1);
}

.select option {
  background: var(--color-bg-base);
  color: var(--text);
  cursor: pointer;
}

.select option:hover {
  background: var(--accent);
}
`;

export default textContent;
