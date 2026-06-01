import { worldIcon } from '../assets/icons/worldIcon';
import { Context, Tool } from '../Interfaces';

export const  enum WorldInspectorEvent {
    OPEN_MODAL = 'world_inspector_tool:open_modal'
};

export class WorldInspectorTool implements Tool {

    public name = 'world inspector';
    public icon = worldIcon;
    private context: Context;
    public btn!: HTMLElement;

    public allows: Record<string, boolean> = {};    // TODO: to be removed

    constructor(context: Context) {

        this.context = context;

        const btn = document.createElement('button');
        btn.classList.add('tool-button');

        btn.innerHTML = this.icon;
        this.btn = btn;

        // btn.onmousedown = () => {

        //     btn.style.background = '#cccccc';
        // };

        // btn.onmouseup = () => {

        //     btn.style.background = '#eeeeee';

        // }

        btn.onclick = (e: MouseEvent) => { this.onClick(e)};

    }

    public mount(container: HTMLElement)  {

        container.appendChild(this.btn);
        this.context.toolManager.setTool(this)
    }

    public onClick = (e: MouseEvent) => {

        this.context.events.emit({
            type: WorldInspectorEvent.OPEN_MODAL,
            target: this
        });

    }

    public onMouseDown(e: MouseEvent) {


    }

}
