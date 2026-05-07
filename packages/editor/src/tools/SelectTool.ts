import { Tool, Context } from "../Interfaces";
import { mousePointerIcon } from "../assets/icons/mousePointerIcon";
import { ViewportEditor } from "../editors/ViewportEditor";
import { RepresentationStore } from "../core/RepresentationStore";

export class SelectTool implements Tool {

    public readonly name = 'select';
    public readonly icon = mousePointerIcon;
    public btn!: HTMLElement;

    private context: Context;

    public allows: Record<string, boolean> = {orbitControls: true};

    constructor(context: Context) {

        this.context = context;
    }

    public onClick(e: MouseEvent): void {

    }

    public onMouseDown(e: MouseEvent, viewportEditor: ViewportEditor) {

        // TODO: may need to get state, scene, selection manager, etc from the context
        const state = viewportEditor.state;

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

}
