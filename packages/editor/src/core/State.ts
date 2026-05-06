// TODO: remember to use the build versions
import { Scene, Vector3 } from "@stemngine/engine";
import { SelectionManager } from "./SelectionManager";

type Cursor = {
    position: Vector3;
    visible: boolean;
}

export type StateConfig = {
    scene: Scene;
    selectionManager: SelectionManager;
    isDragging: boolean;
    cursor: Cursor
};

// TODO: check if state should be a plain object
export class State {

    public scene: Scene;
    public selectionManager: SelectionManager;
    public isDragging: boolean;   // TODO: use generic browser event listener
    public cursor: Cursor; /*  = {position: new Vector3()} */;

    constructor(stateConfig: StateConfig) {

        const { scene, selectionManager, isDragging, cursor} = stateConfig;

        this.scene = scene;
        this.selectionManager = selectionManager;
        this.isDragging = isDragging;
        this.cursor = cursor;
    }

}
