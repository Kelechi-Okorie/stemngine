import baseCSS from '../assets/css/base';
import primitivesCSS from '../assets/css/primitives';
import layoutCSS from '../assets/css/layout';
import buttonCSS from '../assets/css/components/button';
import toolbarCSS from '../assets/css/components/toolbar';
import liCSS from '../assets/css/components/list';
import toolButtonCSS from '../assets/css/components/toolButton';
import folderCSS from '../assets/css/components/folder';
import panelCSS from '../assets/css/components/panel';
import inputCSS from '../assets/css/components/input';
import checkboxCSS from '../assets/css/components/checkbox';
import sliderCSS from '../assets/css/components/slider';
import selectCSS from '../assets/css/components/select';
import colorCSS from '../assets/css/components/color';
import labelCSS from '../assets/css/components/label';
import windowCSS from '../assets/css/components/window';

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

        const layerOrder: StyleLayer[] = ['base', 'primitives', 'layout', 'components'];

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

export function registerStyles(shadow: ShadowRoot) {

    const styleManager = new StyleManager(shadow);
    styleManager.setLayer('base', baseCSS);
    styleManager.setLayer('primitives', primitivesCSS);
    styleManager.setLayer('layout', layoutCSS);
    styleManager.registerComponent('button', buttonCSS);
    styleManager.registerComponent('toolbar', toolbarCSS);
    styleManager.registerComponent('li', liCSS);
    styleManager.registerComponent('tool-button', toolButtonCSS);
    styleManager.registerComponent('folder', folderCSS);
    styleManager.registerComponent('panel', panelCSS);
    styleManager.registerComponent('input', inputCSS);
    styleManager.registerComponent('checkbox', checkboxCSS);
    styleManager.registerComponent('slider', sliderCSS);
    styleManager.registerComponent('select', selectCSS);
    styleManager.registerComponent('color', colorCSS);
    styleManager.registerComponent('label', labelCSS);
    styleManager.registerComponent('window', windowCSS);

}
