

function Layer() {

    const layer = document.createElement('div');

    const child = document.createElement('div');

    layer.appendChild(child);

    return layer;

    //     .ui-root {
    //   position: relative;
    //   width: 100%;
    //   height: 100%;
    // }

    // .layer-base,
    // .layer-overlay,
    // .layer-floating,
    // .layer-modal {
    //   position: absolute;
    //   inset: 0;
    //   pointer-events: none;
    // }

    // .layer-base {
    //   pointer-events: auto;
    // }

}

export { Layer };