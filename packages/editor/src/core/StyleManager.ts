
export class StyleManager {

    private styleEl: HTMLStyleElement;

    private registry = new Map<string, string>();

    constructor(shadowRoot: ShadowRoot) {

        this.styleEl = document.createElement('style');
        shadowRoot.appendChild(this.styleEl);

    }

    public registerStyle(id: string, css: string) {

        this.registry.set(id, css);
        this.render();

    }

    public removeStyle(id: string) {

        this.registry.delete(id);
        this.render();

    }

    public renderStyles() {

        this.render();

    }

    private render() {

        this.styleEl.textContent = Array.from(this.registry.values()).join('\n');

    }

}
