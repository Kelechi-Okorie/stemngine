

export function getMouseNDC(event: MouseEvent, canvas: HTMLCanvasElement) {

    const rect = canvas.getBoundingClientRect();

    return {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height ) * 2 + 1
    };
    
}
