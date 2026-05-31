
const textContent = `
.slider[type="range"] {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  background: transparent; /* IMPORTANT */
}

/* TRACK (WebKit) */
.slider[type="range"]::-webkit-slider-runnable-track {
  height: 4px;
  background: var(--color-neutral-1);
  border-radius: 2px;
}

/* THUMB (WebKit) */
.slider[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: var(--color-neutral-1);
  border-radius: 2px;
  margin-top: calc((4px - 12px) / 2); /* aligns thumb to track */
  cursor: pointer;
}

/* TRACK (Firefox) */
.slider[type="range"]::-moz-range-track {
  height: 4px;
  background: var(--color-neutral-1);
  border-radius: 2px;
}

/* THUMB (Firefox) */
.slider[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: var(--color-neutral-1);
  border: none;
  border-radius: 2px;
  cursor: pointer;
}

.slider[type="range"]:hover::-webkit-slider-thumb {
  background: var(--color-neutral-1);
}

.slider[type="range"]:active::-webkit-slider-thumb {
  transform: scale(1.1);
}

.slider[type="range"]:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 2px var(--accent-soft);
}
`;

export default textContent;
