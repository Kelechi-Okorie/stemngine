import { DirectionalLight, MeshPhongMaterial, OrthographicCamera, Scene } from "@stemngine/engine";
import { PerspectiveCamera } from "@stemngine/engine";
import { WebGLRenderer } from "@stemngine/engine";
import { BoxGeometry } from "@stemngine/engine";
import { MeshBasicMaterial } from "@stemngine/engine";
import { Mesh } from "@stemngine/engine";
import { OrbitControls, Color } from "@stemngine/engine";
import { createCanvasElement } from "@stemngine/engine";

import { State } from "../core/State";


import { Editor } from '../Interfaces';

export class ViewportEditor implements Editor {
    public name: string;
    private renderer = new WebGLRenderer({ antialias: true });
    private state: State

    constructor(name: string, state: State) {

        const { scene, camera, isDragging } = state;

        this.name = name;
        this.state = state;

    }

    public mount(container: HTMLElement) {

        container.appendChild(this.renderer.domElement);

        // TODO: for testing only - should be removed
        this.renderer.setAnimationLoop(this.animate);


    }

    public resize(width: number, height: number) {

        this.renderer.setSize(width, height);
        this.renderer.render(this.state.scene, this.state.camera);  // TODO: may have to batch render

    }

    public update(/* state: any */) { // TODO: should not be any

        // console.log(this.name);
        console.log(this.state);
    }

    public destroy(): void {
        console.log('release all acquired resources')
    }

    public animate = (): void => {

        // cube.rotation.x = time / 2000;
        // cube.rotation.y = time / 1000;

        this.renderer.render(this.state.scene, this.state.camera);

    }

}
