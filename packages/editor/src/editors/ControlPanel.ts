import { Context, Editor } from "../Interfaces";
import { State } from "../core/State";
import { Panel } from "../pane/Panel";
import { Folder } from "../pane/nodes/Folder";
import { renderSchema } from "../pane/controls/factories";

export class ControlPanel implements Editor {

    public name: string = 'Control Panel';
    private state: State;
    public panel!: Panel;
    public context: Context;

    private container!: HTMLElement;
    public header!: HTMLElement;
    public body!: HTMLElement;
    public tab!: HTMLElement;
    public content: HTMLElement = document.createElement('div');

    constructor(context: Context) {

        this.context = context;
        this.state = context.state;

    }

    public mount(container: HTMLElement) {

        // this is supposed to be the built properties panel

        this.container = container;
        this.container.classList.add('control-panel-container')
        this.header = document.createElement('div');
        this.body = document.createElement('div');

        this.header.className = 'control-panel-header';
        this.body.className = 'control-panel-body';

        this.body.style.display = 'flex';

        const panel = new Panel();

        panel.element.appendChild(this.header);
        panel.element.appendChild(this.body);

        this.panel = panel;

        container.appendChild(panel.element);

        this.renderHeader();
        this.renderBody();

        this.render();

    }

    public resize(width: number, height: number) {

    }

    public update() {

        console.log('updating the properties panel');

    }

    public renderHeader() {
        const h5 = document.createElement('h5');
        h5.textContent = 'Control panel';
        this.header.appendChild(h5);
    }

    public renderBody() {

        this.body.appendChild(this.content);

    }

    public unmount() {

        console.log('destroying the control panel')
    }

    public render = () => {

        const simulationManager = this.context.simulationManager;

        const entities = simulationManager.getAllEntities();
        const content = this.content;

        content.innerHTML = '';

        const folder = new Folder('control folder');

        entities.forEach((entity) => {

            if (!entity.schema) return;

            renderSchema(entity.schema, entity, folder);
        })

        content.appendChild(folder.element);

        content.append()

    }

}
