const textContent = `
.window {
    background: var(--panel-2);
    width: var(--width);
    color: var(--text);
    z-index: var(--layer-2);
    /* min-width: 200px; */
    /* min-height: 100p */;
}

.window-header {
    touch-action: none;
}

.window-content {
    background: var(--panel-3);
    overflow: hidden;
    max-height: 800px;
    opacity: 1;
    transition: max-height 0.2s ease, opacity 0.2s ease;
}

.window.collapsed .window-content {
    max-height: 0;
    opacity: 0;
    pointer-events: none;
}

.window-resize-handle {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 12px;
    height: 12px;
    cursor: nwse-resize;
}
`;

export default textContent;
