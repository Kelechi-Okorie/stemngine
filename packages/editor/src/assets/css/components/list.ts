const textContent = `
.list {
    background: var(--panel-2);
    color: var(--text);
}
    
.list-item {
    cursor: pointer;
    padding: var(--space-sm) var(--space-sm);
    /* transition: background 0.05s ease; */
    /* transition: filter 0.05s ease; */
}

.list-item:active {
    background: var(--accent);
}

.list-item:focus {
    outline: none;
    /* box-shadow: var(--focus-ring); */
    border-color: var(--accent);
    background: color-mix(in srgb, var(--panel), var(--hover-overlay));
}

.list-item:hover {
    background: var(--neutral-2-10);
    /* filter: brightness(1.05); */
}
`;

export default textContent;
