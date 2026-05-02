import { Vector2, Raycaster } from "@stemngine/engine";

import { Tool, LAYERS } from "../Interfaces";
import { mousePointerIcon } from "../assets/icons/mousePointerIcon";
import { ViewportEditor } from "../editors/ViewportEditor";

export class SelectTool implements Tool {

    public readonly name = 'select';
    public readonly icon = mousePointerIcon;
    public btn!: HTMLElement;

    public onClick(e: MouseEvent): void {

    }

    public onMouseDown(e: MouseEvent, viewportEditor: ViewportEditor) {

        // TODO: may need to get state, scene, selection manager, etc from the context
        const state = viewportEditor.state;

        const intersect = viewportEditor.getIntersection(e);

        if (intersect) {

            state.selectionManager.set(intersect);

        } else {

            state.selectionManager.set(null);  // click on empty space
        }

    }
    
}
