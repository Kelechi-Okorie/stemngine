// TODO: remember to use the build versions
import { DirectionalLight, MeshPhongMaterial, OrthographicCamera, Scene } from "@stemngine/engine";
import { PerspectiveCamera } from "@stemngine/engine";
import { WebGLRenderer } from "@stemngine/engine";
import { BoxGeometry } from "@stemngine/engine";
import { MeshBasicMaterial } from "@stemngine/engine";
import { Mesh } from "@stemngine/engine";
import { OrbitControls, Color } from "@stemngine/engine";
import { createCanvasElement } from "@stemngine/engine";
import { Camera } from "@stemngine/engine";
import { SelectionManager } from "../pane/SelectionManager";

export type StateConfig = {
    scene: Scene;
    camera: Camera;
    // selection: number;
    selectionManager: SelectionManager;
    isDragging: boolean;
};

export class State {

    public scene: Scene;
    public camera: Camera;
    // public selection: number;
    public selectionManager: SelectionManager;
    public isDragging: boolean;   // TODO: use generic browser event listener

    constructor(stateConfig: StateConfig) {

        const { scene, camera, selectionManager, isDragging} = stateConfig;

        this.scene = scene;
        this.camera = camera;
        this.selectionManager = selectionManager;
        this.isDragging = isDragging;
    }

}