// TODO: use imports from the build
import { DirectionalLight, Group, MeshPhongMaterial, OrthographicCamera, Scene, Vector3 } from "@stemngine/engine";
import { PerspectiveCamera } from "@stemngine/engine";
import { WebGLRenderer } from "@stemngine/engine";
import { BoxGeometry } from "@stemngine/engine";
import { MeshBasicMaterial } from "@stemngine/engine";
import { Mesh } from "@stemngine/engine";
import { OrbitControls, Color } from "@stemngine/engine";
import { createCanvasElement } from "@stemngine/engine";
import { Raycaster } from "@stemngine/engine";
import { Vector2 } from "@stemngine/engine";
import { Node3D, Clock } from "@stemngine/engine";

import { State } from "../core/State";
import { Editor, LAYERS } from '../Interfaces';
import { getMouseNDC } from "./extras";
import { BoxHelper } from "@stemngine/engine";
import { EffectComposer } from "../rendering/postprocessing/EffectComposer";
import { RenderPass } from "../rendering/postprocessing/RenderPass";
import { OutlinePass } from "../rendering/postprocessing/OutlinePass";
import { TestPass } from "../rendering/postprocessing/TestPass";    // TODO: remove
import { attachGizmo, createAxis } from "../rendering/gizmos";

export class ViewportEditor implements Editor {
    public name: string;
    private renderer = new WebGLRenderer({ antialias: true });
    private state: State;

    private highlightBox: BoxHelper | null = null;
    // private outlinePass: OutlinePass;
    // public composer: EffectComposer;
    private selectedObject!: Mesh;  // TODO: should be a set
    public clock = new Clock();

    constructor(name: string, state: State) {

        const { scene, camera } = state;

        this.name = name;
        this.state = state;

        this.renderer.domElement.addEventListener('click', (e) => {

            this.onMouseClick(e, this.renderer.domElement);

        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            this.onMouseMove(e, this.renderer.domElement);
        });

        this.state.selectionManager.subscribe((selectedObject) => {

            this.highlightObject(selectedObject);

        });

        // TODO: change window to be the 3d editor viewport
        // this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.renderer.setPixelRatio(window.devicePixelRatio);

        // this.composer = new EffectComposer(this.renderer, undefined);

        // this.composer.addPass(new RenderPass(scene, camera));

        // this.outlinePass = new OutlinePass(
        //     // TODO: change window to be the 3d editor viewport
        //     // new Vector2(this.renderer.domElement.width, this.renderer.domElement.height),
        //     new Vector2(window.innerWidth, window.innerHeight),
        //     scene,
        //     camera,
        //     []
        // );

        // this.outlinePass.edgeStrength = 3;
        // this.outlinePass.edgeThickness = 1;
        // this.outlinePass.visibleEdgeColor.set(0xffff00);
        // this.outlinePass.hiddenEdgeColor.set(0x22090a);

        // this.composer.addPass(this.outlinePass);

        // // TODO: should this be here
        // this.clock.tick();

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
        this.clock.tick();

        const dt = this.clock.dt;

        // this.state.scene.children[2].rotation.x = dt;

        this.renderer.render(this.state.scene, this.state.camera);

        // this.composer.render(dt);


    }

    public onMouseClick(event: MouseEvent, canvas: HTMLCanvasElement) {

        const rect = canvas.getBoundingClientRect();

        const mouse = new Vector2();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // TODO: may need to set near and far
        const raycaster = new Raycaster();
        raycaster.layers.set(LAYERS.DEFAULT);

        raycaster.setFromCamera(mouse, this.state.camera);

        // intersects is array of RaycasterIntersection objects sorted by distance
        const intersects = raycaster.intersectObjects(this.state.scene.children, true); // recursive


        if (intersects.length > 0) {

            const selectedObject = intersects[0].object;
            this.state.selectionManager.set(selectedObject);


        } else {

            this.state.selectionManager.set(null);  // click on empty space
        }

    }

    private highlightObject(selected: Mesh | null) {

        // remove old highlight
        if (this.selectedObject) {

            // this.state.scene.remove(this.highlightBox);
            // this.highlightBox = null;

        }

        if (selected) {

            // selected.material.color.set('purple');


            // this.highlightBox = new BoxHelper(object, 0xffff00) // yellow
            // this.highlightBox.layers.set(LAYERS.HELPERS);
            // console.log({h: this.highlightBox})

            // this.state.scene.add(this.highlightBox);

        }


    }

    private onMouseMove(event: MouseEvent, canvas: HTMLCanvasElement) {

        // const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        const mouse = new Vector2();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // may need to set near and far
        const raycaster = new Raycaster();
        raycaster.setFromCamera(mouse, this.state.camera);

        const intersects = raycaster.intersectObjects(this.state.scene.children, true);

        if (intersects.length > 0) {

            const hovered = intersects[0].object;
            canvas.style.cursor = 'pointer';
            // optionally show hover effect

        } else {

            canvas.style.cursor = 'default';

        }

    }

}
