import { WindowFrame } from "./WindowFrame";

export class ModalSystem {

    private container: HTMLElement;

    private windows = new Map<string, WindowFrame>();

    constructor(container: HTMLElement) {

        this.container = container;

    }

    open(key: string, content: HTMLElement, title = "Window") {

        if (this.windows.has(key)) {

            const windowFrame = this.windows.get(key)!;
            windowFrame.element.style.zIndex = String(Date.now());  // simple stacking
            return;
        }

        const windowFrame = new WindowFrame(title);
        windowFrame.setContent(content);

        windowFrame.onCloseClick(() => {

            this.container.removeChild(windowFrame.element);
            this.windows.delete(key);

        });

        this.windows.set(key, windowFrame)
        this.container.appendChild(windowFrame.element);
    }

    public close(key: string) {

        if (!this.windows.has(key)) return;

        const windowFrame = this.windows.get(key)!;

        this.container.removeChild(windowFrame.element);
        this.windows.delete(key);
    }

    public get(key: string): WindowFrame | undefined {
        return this.windows.get(key);
    }

}
