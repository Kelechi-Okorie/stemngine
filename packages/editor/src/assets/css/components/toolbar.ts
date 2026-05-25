
const textContent = `
.toolbar {
  position: absolute;
  z-index: var(--layer-1);
}

.toolbar-right {
  top: 100px;
  right: 0;
}

.toolbar-bottom {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.toolbar-top {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}
`;

export default textContent;
