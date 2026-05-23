// xs: 0px     → 479px    // small phones
// sm: 480px   → 767px    // large phones
// md: 768px   → 1023px   // tablets / small laptops
// lg: 1024px+            // desktop

const textContent = `
/* Base = xs + sm: 0px -> 479px (mobile first) */
.layout {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
}

/* Drawer behaviour (modile default) */
.b {
  position: fixed;

  left: 0;
  right: 0;
  bottom: 0;

  height: 50vh;
  max-height: 80vh;

  z-index: 100;

  transform: translateY(100%);
  opacity: 0;
  pointer-events: none;

  transition: transform 0.25s ease, opacity 0.2s ease;

  display: none;
  transform: translateY(60%);
  transition: transform 0.2s ease;
}

.b.open {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.fab {
  position: fixed;
  right: 16px;
  bottom: 16px;

  width: 56px;
  height: 56px;

  border-radius: 50%;
  background: var(--accent);
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 200;
}

/* MD breakpoint (tablet) */
@media (min-width: 768px) {
  .layout {
    grid-tempate-columns: 1fr 280px;
  }
  
  .b {
    display: relative;
    transform: none;
    opacity: 1;
    height: 100%;
    pointer-events: auto;

    height: 100%;
  }

  .fab {
    display: none;
  }
}

/* LG breakpoint (deskpoint) */
@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 1fr 320px;
  }

}

`;

export default textContent;
