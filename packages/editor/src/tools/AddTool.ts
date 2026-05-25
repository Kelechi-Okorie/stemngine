import { addIcon } from '../assets/icons/addIcon';
import { Context, Tool } from '../Interfaces';

export const  enum AddToolEvent {
    ADDTOOL_OPEN_MODAL = 'add_tool:open_modal'
};

export class AddTool implements Tool {

    public name = 'add';
    public icon = addIcon;
    private context: Context;
    public btn!: HTMLElement;

    public allows: Record<string, boolean> = {};


    constructor(context: Context) {

        this.context = context;

        const btn = document.createElement('button');
        btn.style.width = '32px';
        btn.style.height = '32px';
        btn.style.background = '#eeeeee';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';

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

        // this.context.toolManager.setTool(this);

        this.context.events.emit({
            type: AddToolEvent.ADDTOOL_OPEN_MODAL,
            target: this
        });

    }

    public onMouseDown(e: MouseEvent) {


    }

}
