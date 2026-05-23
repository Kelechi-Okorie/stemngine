
const textContent = `
.slider {
    width: 100%;
    height: 24px;
    display: flex;
    align-items: center;
}

.slider input[type="range"] {
    width: 100%;
    appearance: none;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    accent-color: var(--accent);
}

.slider input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: var(--accent);
    border-radius: 50%;
    cursor: pointer;
}
`;

export default textContent;
