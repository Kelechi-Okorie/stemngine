// TODO: use imports from the build
import { BufferGeometry, Camera, DirectionalLight, Group, LineBasicMaterial, MeshPhongMaterial, OrthographicCamera, Scene, Vector3, Line, isOrthographicCamera, isPerspectiveCamera, GridHelper, Layers } from "@stemngine/engine";
import { PerspectiveCamera, Plane, PlaneGeometry } from "@stemngine/engine";
import { WebGLRenderer } from "@stemngine/engine";
import { BoxGeometry } from "@stemngine/engine";
import { MeshBasicMaterial } from "@stemngine/engine";
import { Mesh } from "@stemngine/engine";
import { OrbitControls } from "../controllers/OrbitControls";
import { createCanvasElement } from "@stemngine/engine";
import { Raycaster } from "@stemngine/engine";
import { Vector2 } from "@stemngine/engine";
import { Node3D, TextureLoader } from "@stemngine/engine";

import { State } from "../core/State";
import { Editor, Context, LAYERS, Tool } from '../Interfaces';
import { BoxHelper } from "@stemngine/engine";
import { EffectComposer } from "../rendering/postprocessing/EffectComposer";
import { RenderPass } from "../rendering/postprocessing/RenderPass";
import { OutlinePass } from "../rendering/postprocessing/OutlinePass";
import { TestPass } from "../rendering/postprocessing/TestPass";    // TODO: remove
import { attachGizmo, createAxis } from "../rendering/gizmos";
import { Toolbar } from "../tools/Toolbar";
import { ToolManager, ToolManagerEventTypes } from "../tools/ToolManager";
import { Cursor3D } from "../viewport/renderer/Cursor3D";
import { ViewportGizmo } from "../viewport/renderer/ViewportGizmo";
import { Grid } from "../viewport/renderer/Grid";
import { RaycasterIntersection } from "../../../engine/src/core/Raycaster";

export class ViewportEditor implements Editor {
    public name: string;
    private width!: number;
    private height!: number
    public readonly renderer: WebGLRenderer;
    public readonly state: State;
    private context: Context;

    private highlightBox: BoxHelper | null = null;
    private selectedObject!: Mesh;  // TODO: should be a set
    private toolbar: Toolbar;

    public readonly camera: Camera;
    private cursor: Cursor3D;
    private viewportGizmo: ViewportGizmo;

    private raycaster = new Raycaster();
    private mouse = new Vector2();

    private orbitControl: OrbitControls;

    public grid!: Grid;

    constructor(name: string, context: Context) {

        this.renderer = new WebGLRenderer({ antialias: true });
        this.context = context;

        this.state = context.state;

        this.cursor = new Cursor3D(this.context);
        this.viewportGizmo = new ViewportGizmo();

        // TODO: to be removed
        const left = -5;
        const right = 5;
        const top = 5;
        const bottom = -5;
        const near = 0.1;
        const far = 1000
        // this.camera = new OrthographicCamera(left, right, top, bottom, near, far);
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, near, far);

        this.camera.position.x = 2;
        this.camera.position.y = 7;
        this.camera.position.z = 15;
        this.camera.lookAt(0, 0, 0);

        this.name = name;

        this.toolbar = new Toolbar(this.context);

        this.orbitControl = new OrbitControls(this.camera as OrthographicCamera, this.renderer.domElement);

        // this.state.renderer.domElement.addEventListener('mousemove', (e) => {
        //     this.onMouseMove(e, this.state.renderer.domElement);
        // });

        // this.state.selectionManager.subscribe((selectedObject) => {

        //     this.highlightObject(selectedObject);

        // });

        // TODO: may need to set near and far
        this.raycaster.layers.set(LAYERS.DEFAULT);

        this.context.simulationRuntime.schedule('render', this.update);


    }

    public mount(container: HTMLElement) {

        const grid = new Grid();
        this.state.scene.add(grid.grid);
        this.grid = grid;

        container.appendChild(this.renderer.domElement);


        // TODO: may have to be inside the select tool
        // TODO: take care of the as OrthographicCamera

        this.toolbar.create(container);

        const domElement = this.renderer.domElement;
        const toolManager = this.context.toolManager;

        domElement.addEventListener('mousedown', (e) => {

            toolManager.onMouseDown(e, this);

        });

        domElement.addEventListener('mousemove', (e) => {

            toolManager.onMouseMove(e, this);

        });

        domElement.addEventListener('click', (e) => {

            toolManager.onClick(e, this);

        });

        this.cursor.attach(this.state.scene);

        this.context.toolManager.on(ToolManagerEventTypes.TOOL_SET, this.updateInteractiveMode.bind(this));

    }

    public resize(width: number, height: number) {

        this.width = width;
        this.height = height;

        this.renderer.setSize(width, height);
        this.renderer.render(this.state.scene, this.camera);  // TODO: may have to batch render

    }

    public update = (dt: number) => {

        // 1. grid
        this.grid.update(this.camera);

        // 2. 3D cursor
        this.cursor.update(this.camera, this.renderer);

        // 3. render
        this.renderer.setViewport(0, 0, this.width, this.height);
        this.renderer.render(this.state.scene, this.camera);

        // 4. viewport gizmo
        const context = {
            mainCamera: this.camera,
            renderer: this.renderer,
            width: this.width,
            height: this.height
        }
        this.viewportGizmo.update(context);
        this.viewportGizmo.render(context);

    }

    public unmount(): void {
        console.log('release all acquired resources');

        this.context.toolManager.remove(ToolManagerEventTypes.TOOL_SET, this.updateInteractiveMode);
        this.context.simulationRuntime.unSchedule(this.update);

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

        // const canvas = this.state.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        const mouse = new Vector2();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // may need to set near and far
        const raycaster = new Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.state.scene.children, true);

        if (intersects.length > 0) {

            const hovered = intersects[0].object;
            canvas.style.cursor = 'pointer';
            // optionally show hover effect

        } else {

            canvas.style.cursor = 'default';

        }

    }

    public getIntersectionPoint(e: MouseEvent): Vector3 | null {

        // try objects first
        const hits = this.intersect(e);

        if (hits.length > 0) return hits[0].point;

        // fallback: ground plane
        const plane = new Plane(new Vector3(0, 0, 1), 0);
        const point = new Vector3();

        if (this.raycaster.ray.intersectPlane(plane, point)) return point;

        return null;

    }

    /**
     * Gets all the intersections
     * 
     * @param event 
     * @returns 
     */
    public getIntersections(e: MouseEvent): RaycasterIntersection[] {

        const hits = this.intersect(e);

        return hits;
    }

    /**
     * Gets the first intersection
     * 
     * @param event 
     * @returns 
     */
    public getIntersection(e: MouseEvent): RaycasterIntersection | null {

        const hits = this.intersect(e);

        if (hits.length > 0) return hits[0];

        return null;
    }

    public intersect(e: MouseEvent): RaycasterIntersection[] {

        const rect = this.renderer.domElement.getBoundingClientRect();

        this.mouse.set(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        )

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const hits = this.raycaster.intersectObjects(this.state.scene.children, true);

        return hits;

    }

    public updateInteractiveMode(tool: Tool) {

        // this.orbitControl.enabled = tool.name === "select";
        this.orbitControl.enabled = tool.allows['orbitControls'];
    }

}

// 🚀 After that, your editor becomes powerful

// You can add:

// 1. Hover preview (before click)
// mousemove → temporary hover point
// click → commit to cursor
// 2. Grid snapping
// cursor snaps to nearest grid cell
// 3. Surface snapping
// cursor sticks to object surfaces
