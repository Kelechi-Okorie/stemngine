
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

        // const order: StyleLayer[] = ['base', 'primitives', 'components'];

        // this.styleEl.textContent = order.map(layer => this.layers.get(layer) || '').join('\n');

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

    //     One important improvement (optional but powerful)
    // Right now order is implicit.
    // Later you may want:
    // registerComponent(id, css, layer)
    // So components can belong to:
    // primitives
    // components
    // or even custom layers
    // But DO NOT add this yet unless needed.





    // public registerStyle(id: string, css: string) {

    //     // this.registry.set(id, css);
    //     // this.render();

    //     if (!this.registry.has(id)) {

    //         this.order.push(id);

    //     }

    //     this.registry.set(id, css);
    //     this.render();

    // }

    // public removeStyle(id: string) {

    //     this.registry.delete(id);
    //     this.render();

    // }

    // public renderStyles() {

    //     this.render();

    // }

    // private render() {

    //     // this.styleEl.textContent = Array.from(this.registry.values()).join('\n');

    //     this.styleEl.textContent = this.order.map(id => this.registry.get(id)).join('\n');

    // }


}
