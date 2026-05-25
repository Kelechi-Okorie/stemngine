import { Tool, Context } from "../Interfaces";
import { mousePointerIcon } from "../assets/icons/mousePointerIcon";
import { ViewportEditor } from "../editors/ViewportEditor";
import { RepresentationStore } from "../core/RepresentationStore";

export class SelectTool implements Tool {

    public readonly name = 'select';
    public readonly icon = mousePointerIcon;
    public btn: HTMLElement;

    private context: Context;

    public allows: Record<string, boolean> = { orbitControls: true };

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

        btn.onclick = (e: MouseEvent) => this.onClick;

    }

    public mount(container: HTMLElement) {

        container.appendChild(this.btn);
        this.context.toolManager.setTool(this)

    }

    public onClick = (e: MouseEvent, viewportEditor: ViewportEditor): void => {

        // TODO: may need to get state, scene, selection manager, etc from the context
        this.context.toolManager.setTool(this);
        const state = this.context.state;

        const intersect = viewportEditor.getIntersection(e);

        if (intersect) {

            const renderIndex = this.context.renderIndex;
            const mesh = intersect.object;

            const repId = renderIndex.getRepId(mesh);

            if (repId === undefined) return;

            const rep = RepresentationStore.getById(repId);

            if (rep === undefined) return;

            state.selectionManager.set(rep.entity);

        } else {

            state.selectionManager.set(null);  // click on empty space
        }

    }

    // public onMouseDown(e: MouseEvent, viewportEditor: ViewportEditor) {

    // // TODO: may need to get state, scene, selection manager, etc from the context
    // const state = this.context.state;

    // const intersect = viewportEditor.getIntersection(e);

    // if (intersect) {

    //     const renderIndex = this.context.renderIndex;
    //     const mesh = intersect.object;

    //     const repId = renderIndex.getRepId(mesh);

    //     if (repId === undefined) return;

    //     const rep = RepresentationStore.getById(repId);

    //     if (rep === undefined) return;

    //     state.selectionManager.set(rep.entity);

    // } else {

    //     state.selectionManager.set(null);  // click on empty space
    // }

    // }

}
