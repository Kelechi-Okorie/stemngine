import { Vector2 } from "@stemngine/engine";

function getMouseNDC(e: MouseEvent, canvas: HTMLCanvasElement): Vector2 {

    const rect = canvas.getBoundingClientRect();

    const mouse = new Vector2();

    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    return mouse;

}

export {
    getMouseNDC
}
