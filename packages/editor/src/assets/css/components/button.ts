const textContent = `

.button {
  background: var(--color-neutral-1);
  color: var(--color-bg-base);
  padding: var(--space) var(--space);
  border-radius: var(--radius);
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease;
  flex: 1;
  transition: filter 0.05s ease;
}

.button:active {
    background: var(--color-neutral-3);
    filter: brightness(1.05);
}

.button:focus {
    outline: none;
    box-shadow: var(--focus-ring);
}

.button:hover {
    background: var(--color-neutral-2);
}
`;

export default textContent;
