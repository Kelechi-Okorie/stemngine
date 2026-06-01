const textContent = `
.folder {
    color: var(--text);
    padding-left: var(--space);
    background: var(--neutral-2-10);
}

.folder-header {}

.folder-content {
    background: var(--color-bg-base);
    padding: var(--space-sm) var(--space-sm) var(--space) 0;
    max-height: 600px;
    opacity: 1;
    transition: max-height 0.2s ease, opacity 0.2s ease;
}

.folder.collapsed .folder-content {
    max-height: 0;
    opacity: 0;
    pointer-events: none;
}
`;

export default textContent;
