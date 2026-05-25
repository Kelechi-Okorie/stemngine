

export class ModalSystem {

    private container: HTMLElement;

    constructor(container: HTMLElement) {
        this.container = container;
    }

    open(modal: HTMLElement) {

        const overlay = document.createElement('div');

        overlay.classList.add('overlay', 'z-overlay');

        overlay.onclick = () => {
            this.close(overlay);
        };

        const surface = document.createElement('div');
        surface.classList.add('absolute', 'center-xy', 'z-modal', 'surface', 'column', 'width');

        overlay.appendChild(surface);
        surface.appendChild(modal);

        this.container.appendChild(overlay);
    }

    private close(overlay: HTMLElement) {

        if (!overlay) return;

        this.container.removeChild(overlay);
    }

}
