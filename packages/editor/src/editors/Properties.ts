import { State } from "../core/State";
import { Editor, Context } from "../Interfaces";
import { Panel } from "../pane/Panel";
import { InspectorRegistry } from "./inspectors/InspectorRegistry";
import { ObjectInspector } from "./inspectors/ObjectInspector";
import { WorldInspector } from "./inspectors/WorldInspector";

/**
 * The properties panel
 */
export class Properties implements Editor {

    public name: string;
    private state: State;
    public panel!: Panel;
    public context: Context;

    private container!: HTMLElement;
    public header!: HTMLElement;
    public body!: HTMLElement;
    public tab!: HTMLElement;
    public content: HTMLElement = document.createElement('div');

    private inspectorRegistry: InspectorRegistry;

    constructor(name: string, context: Context) {

        const { state } = context;

        this.context = context;

        this.name = name;
        this.state = state;

        this.inspectorRegistry = new InspectorRegistry();

    }

    public mount(container: HTMLElement) {

        // this is supposed to be the built properties panel

        this.container = container;
        this.header = document.createElement('div');
        this.body = document.createElement('div');

        this.header.className = 'editor-header';
        this.body.className = 'editor-body';

        this.body.style.display = 'flex';

        const panel = new Panel();

        panel.element.appendChild(this.header);
        panel.element.appendChild(this.body);

        this.panel = panel;

        this.inspectorRegistry.register(new WorldInspector(this));
        this.inspectorRegistry.register(new ObjectInspector(this));

        container.appendChild(panel.element);

        this.renderHeader();
        this.renderBody();

    }

    public resize(width: number, height: number) {

    }

    public update() {

        console.log('updating the properties panel');

    }

    public renderHeader() {
        const h5 = document.createElement('h5');
        h5.textContent = 'Properties';
        this.header.appendChild(h5);
    }

    public renderBody() {

        this.renderTab();
        // this.renderContent();

        // const content = document.createElement('div');
        // content.classList.add('editor-body-content');
        // this.content = content;
        this.body.appendChild(this.content);

    }

    private renderTab() {
        const tab = document.createElement('div');
        tab.classList.add('editor-body-tab');

        tab.style.display = 'flex';
        tab.style.flexDirection = 'column';
        tab.style.flex = '0 0 35px';
        tab.style.background = '#eeeeee'

        this.tab = tab;

        const inspectors = this.inspectorRegistry.getAll();

        for (const inspector of inspectors) {

            // const span = document.createElement('span');
            const btn = document.createElement('button');
            btn.style.width = '100%';
            btn.style.height = '32px';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.style.marginBottom = '2px';

            btn.innerHTML = inspector.icon;

            btn.onclick = inspector.onClick;

            tab.appendChild(btn);
            
        }

        this.body.appendChild(tab);

    }

    public unmount() {

        console.log('destroying the properties panel')
    }

}
