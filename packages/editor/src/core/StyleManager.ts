
export class StyleManager {

    private static _instance: StyleManager;

    private static styleEl = document.createElement('style');

    private registry = new Map<string, string>();

    constructor() {

    }

    public static get instance(): StyleManager {

        if (!this._instance) {
            this._instance = new StyleManager();

            document.head.appendChild(StyleManager.styleEl);

        }

        return this._instance;

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

        StyleManager.styleEl.textContent = Array.from(this.registry.values()).join('\n');

    }

}
