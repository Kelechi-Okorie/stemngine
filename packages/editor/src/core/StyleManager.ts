
type StyleLayer = 'base' | 'primitives' | 'layout' | 'components';

export class StyleManager {

    private styleEl: HTMLStyleElement;
    private layers = new Map<StyleLayer, string>();
    private components = new Map<string, string>();

    // private registry = new Map<string, string>();

    // private order: string[] = [];   // TODO: how to remove from order

    constructor(shadowRoot: ShadowRoot) {

        this.styleEl = document.createElement('style');
        shadowRoot.appendChild(this.styleEl);

    }

    public setLayer(layer: StyleLayer, css: string) {

        this.layers.set(layer, css);
        this.render();

    }

    public registerComponent(id: string, css: string) {

        this.components.set(id, css);
        this.render();

    }

    public removeComponent(id: string) {

        this.components.delete(id);
        this.render();
    }

    private render() {

        const layerOrder: StyleLayer[] = ['base', 'primitives', 'layout',  'components'];

        const layersCSS = layerOrder.map(layer => this.layers.get(layer) || '').join('\n');

        const componentsCSS = Array.from(this.components.values()).join('\n');

        this.styleEl.textContent = `
        ${layersCSS}
        ${componentsCSS}
        `;

    }

    public updateStyle(id: string, css: string) {

        // if (this.registry)
    }

}
