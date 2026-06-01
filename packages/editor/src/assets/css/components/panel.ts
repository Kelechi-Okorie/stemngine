const textContent = `
.panel {
    color: var(--text);
    padding-left: var(--space);
    background: var(--neutral-2-10);
}

.panel-content {
    background: var(--color-bg-base);
    padding: var(--space-sm) var(--space-sm) var(--space) var(--space-md);
    max-height: 600px;
    opacity: 1;
    transition: max-height 0.2s ease, opacity 0.2s ease;
}
`;

export default textContent;
