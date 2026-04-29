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

        const state = viewportEditor.state;
        const canvas = viewportEditor.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        const mouse = new Vector2();

        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        // TODO: may need to set near and far
        const raycaster = new Raycaster();
        raycaster.layers.set(LAYERS.DEFAULT);

        raycaster.setFromCamera(mouse, viewportEditor.camera);

        // TODO: may need to get state, scene, selection manager, etc from the context

        // intersects is array of RaycasterIntersection objects sorted by distance
        const intersects = raycaster.intersectObjects(state.scene.children, true); // recursive


        if (intersects.length > 0) {

            const selectedObject = intersects[0].object;
            state.selectionManager.set(selectedObject);


        } else {

            state.selectionManager.set(null);  // click on empty space
        }

    }
}
