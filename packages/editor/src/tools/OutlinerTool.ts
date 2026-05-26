import { circleOffIcon } from '../assets/icons/circleOff';
import { Context, Tool } from '../Interfaces';

export const  enum OutlinerEvent {
    OUTLINER_OPEN_MODAL = 'outliner_tool:open_modal'
};

export class OutlinerTool implements Tool {

    public name = 'outliner';
    public icon = circleOffIcon;
    private context: Context;
    public btn!: HTMLElement;

    public allows: Record<string, boolean> = {};


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

        // this.context.toolManager.setTool(this);

        this.context.events.emit({
            type: OutlinerEvent.OUTLINER_OPEN_MODAL,
            target: this
        });

    }

    public onMouseDown(e: MouseEvent) {


    }

}
