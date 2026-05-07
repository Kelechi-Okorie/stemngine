import { BufferGeometry, Camera, Group, Line, LineBasicMaterial, Material, Scene, Vector3, WebGLRenderer, isOrthographicCamera, isPerspectiveCamera } from "@stemngine/engine";

import { Context, LAYERS } from "../../Interfaces";

export class Cursor3D {

    private object: Group;
    private context: Context;
    private material: Material;

    constructor(context: Context) {

        this.context = context;
        this.object = new Group();
        this.object.name = '3D Cursor'

        const material = new LineBasicMaterial({ color: 0xff0000 });
        this.material = material;

        const xLine = new Line(
            new BufferGeometry().setFromPoints([
                new Vector3(-0.2, 0, 0),
                new Vector3(0.2, 0, 0)
            ]),
            material
        );

        xLine.name = 'x line';

        const yLine = new Line(
            new BufferGeometry().setFromPoints([
                new Vector3(0, -0.2, 0),
                new Vector3(0, 0.2, 0)
            ]),
            material
        );

        yLine.name = 'y line';

        xLine.layers.set(LAYERS.HELPERS);
        yLine.layers.set(LAYERS.HELPERS);
        this.object.layers.set(LAYERS.HELPERS);

        this.object.addChildren([xLine, yLine]);

    }

    public attach(scene: Scene) {

        scene.add(this.object);

    }

    public update(camera: Camera, renderer: WebGLRenderer) {

        const state = this.context.state;

        // TODO: make 3d cursor a sprite to avoid updating it's orientation in the update method

        // 1. position
        this.object.position.copy(state.cursor.position);

        // 2. billboard
        this.object.quaternion.copy(camera.quaternion);

        // 3 constant screen size
        const viewportHeight = renderer.domElement.clientHeight;
        const desiredPixels = 30;
        let worldHeight: number = 0
        let pixelsPerUnit: number;

        if (isOrthographicCamera(camera)) {

            worldHeight = (camera.top - camera.bottom) / camera.zoom;


        } else if (isPerspectiveCamera(camera)) {

            const distance = camera.position.distanceTo(state.cursor.position);
            const fov = camera.fov * Math.PI / 180; // radians
            worldHeight = 2 * Math.tan(fov / 2) * distance;

        }

        pixelsPerUnit = viewportHeight / worldHeight;
        const scale = desiredPixels / pixelsPerUnit;

        this.object.scale.setScalar(scale);

    }

    public dispose() {

        this.material.dispose();

    }

}
