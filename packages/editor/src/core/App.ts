// TODO: make sure every module in the editor uses the exports from
// stemngine build

import { DirectionalLight, MeshPhongMaterial, OrthographicCamera, Scene } from "@stemngine/engine";
import { PerspectiveCamera } from "@stemngine/engine";
import { WebGLRenderer } from "@stemngine/engine";
import { BoxGeometry } from "@stemngine/engine";
import { MeshBasicMaterial } from "@stemngine/engine";
import { Mesh } from "@stemngine/engine";
import { OrbitControls, Color } from "@stemngine/engine";
import { createCanvasElement } from "@stemngine/engine";


import { Editor, Region } from "../Interfaces";
import { ViewportEditor } from "../editors/ViewportEditor";
import { Outliner } from "../editors/Outliner";
import { Properties } from "../editors/Properties";
import { State, StateConfig } from '../core/State';
import { SelectionManager } from "../pane/SelectionManager";
import { SphereGeometry } from "@stemngine/engine";

export class App {

    private container: HTMLElement;
    private region: Region;
    public state: State;

    private elementMap = new Map<string, HTMLElement>();
    private splitMap = new Map<string, { a: HTMLElement, b: HTMLElement, divider: HTMLElement }>();

    private draggingRegion: Region | null = null;

    constructor(container: HTMLElement) {

        this.container = container;
        this.state = this.createState();

        this.region = {
            type: 'split',
            id: 'parent-id',
            direction: 'horizontal',
            ratio: 0.7,
            a: {
                type: 'leaf',
                id: 'a-1',
                name: '3D viewport',
                editor: new ViewportEditor('3D viewport', this.state)
            },
            b: {
                type: 'split',
                id: 'b-1',
                direction: 'vertical',
                ratio: 0.3,
                a: { type: 'leaf', id: 'a-2', name: 'outliner', editor: new Outliner('outliner', this.state) },
                b: { type: 'leaf', id: 'b-2', name: 'properties', editor: new Properties('properties panel', this.state) }
            }
        }

    }

    public bootstrap() {

        this.render();

        requestAnimationFrame(() => {

            this.layout();

        });

        // TODO: may have to use the general event listener
        window.addEventListener('resize', () => {

            this.layout();

        });

    }

    public render() {

        this.elementMap.clear();
        this.splitMap.clear();

        this.renderRegion(this.region, this.container);
    }

    public layout() {

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.layoutRegion(this.region, width, height);
    }

    /**
     * Recursively convert layout tree to DOM
     * 
     * @param region 
     * @param container 
     */
    public renderRegion(region: Region, container: HTMLElement) {

        // leaf
        if (region.type === 'leaf') {
            this.renderEditor(region, container);
            return;

        }

        // split
        // TODO: use prebuilt css instead
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.flexDirection = region.direction === 'horizontal' ? 'row' : 'column';

        const a = document.createElement('div');
        const b = document.createElement('div');

        // apply size ratios
        a.style.flex = `${region.ratio} 1 0`;
        b.style.flex = `${1 - region.ratio} 1 0`;

        const divider = this.createDivider(region);

        if (divider === undefined) {

            throw new Error('divider cannot be created');

        }

        // a.style.background = 'blue';
        // b.style.background = 'green';
        // divider.style.background = 'red';


        wrapper.appendChild(a);
        wrapper.appendChild(divider);
        wrapper.appendChild(b);

        container.appendChild(wrapper);

        this.splitMap.set(region.id, { a, b, divider });

        this.renderRegion(region.a, a);
        this.renderRegion(region.b, b);

    }

    public renderEditor(region: Region, container: HTMLElement) {

        if (!('editor' in region)) {

            throw new Error('App: renderEditor - No editor in region');

        }

        const el = document.createElement('div');
        el.style.width = '100%';
        el.style.height = '100%';
        // el.style.background = 'yellow';    // TODO: to be removed
        el.style.padding = '2px';

        container.appendChild(el);

        // store reference for layout later
        this.elementMap.set(region.id, el);

        // mount editor
        region.editor.mount(el);

    }

    private layoutRegion(region: Region, width: number, height: number) {

        // leaf
        if (region.type === 'leaf') {
            const wrapper = this.elementMap.get(region.id)!;

            wrapper.style.width = `${width}px`;
            wrapper.style.height = `${height}px`;

            // 🔥 notify editor
            region.editor.resize(width, height);

            return;
        }

        const split = this.splitMap.get(region.id)!;

        const wrapper = split.a.parentElement as HTMLElement;

        wrapper.style.width = `${width}px`;
        wrapper.style.height = `${height}px`;

        if (region.direction === 'horizontal') {

            const wA = width * region.ratio;
            const wB = width - wA;

            this.layoutRegion(region.a, wA, height);
            this.layoutRegion(region.b, wB, height);

        } else {

            const hA = height * region.ratio;
            const hB = height - hA;

            this.layoutRegion(region.a, width, hA);
            this.layoutRegion(region.b, width, hB);

        }
    }

    // TODO: createState should be done by the state class
    /**
     * 
     * @returns 
     */
    private createState(): State {

        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new Mesh(geometry, material);
        cube.position.z = -10;

        const geometry2 = new SphereGeometry();
        const material2 = new MeshBasicMaterial({color: 0xff0000});
        const sphere1 = new Mesh(geometry2, material2);
        sphere1.position.x = 2;

        const scene = new Scene();
        scene.background = new Color(0xff0000)

        const left = -5;
        const right = 5;
        const top = 5;
        const bottom = -5;
        const near = 5;
        const far = 50
        const camera = new OrthographicCamera(left, right, top, bottom, near, far);
        // const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        scene.add(cube);
        scene.add(sphere1);

        camera.position.z = 20;
        // camera.position.x = 2;
        camera.lookAt(0, 0, 0);

        return {
            scene,
            camera,
            // selection: -1,
            selectionManager: new SelectionManager(),
            isDragging: false   // TODO: use the generic browser event dispatcher
        }

    }

    /**
     * for divider
     * - larger invisible hit area (better ux)
     * - hover highlight
     * - smooth drag (no jitter)
     * - snapping
     */

    /**
     * 
     * @param region 
     * @returns 
     */
    public createDivider(region: Region) {

        if (!('direction' in region)) return;

        const divider = document.createElement('div');
        divider.className = 'divider';
        divider.style.background = 'red';
        divider.style.flexShrink = '0';

        if (region.direction === 'horizontal') {

            divider.style.width = '4px';
            divider.style.height = '100%';
            divider.style.cursor = 'col-resize';

        } else {

            divider.style.height = '4px';
            divider.style.width = '100%';
            divider.style.cursor = 'row-resize';
        }

        // TODO: may have to use global event listener
        divider.addEventListener('mousedown', (e) => {

            e.preventDefault();
            this.startDragging(region, e);
        });

        return divider;

    }

    private startDragging(region: Region, e: MouseEvent) {

        this.draggingRegion = region;

        const onMouseMove = (moveEvent: MouseEvent) => this.onDrag(moveEvent);
        const onMouseUp = () => this.stopDrag(onMouseMove, onMouseUp);

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    private onDrag(e: MouseEvent) {

        if (!this.draggingRegion) return;


        const split = this.draggingRegion;

        if (!('direction' in split)) {

            throw new Error('App: onDrag - no direction in split');

        }

        const { a, b } = this.splitMap.get(split.id)!;

        const rect = a.parentElement!.getBoundingClientRect();  // wrapper div

        let delta: number;

        if (split.direction === 'horizontal') {

            delta = e.movementX / rect.width;

        } else {

            delta = e.movementY / rect.height;

        }

        split.ratio = Math.max(0.1, Math.min(0.9, split.ratio + delta));

        console.log(split.ratio)

        this.layout();
    }

    private stopDrag(onMove: (e: MouseEvent) => void, onUp: () => void) {

        this.draggingRegion = null;

        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
    }


}




/**
 * 
 * Features unlocked
 * - drag panels between splits
 * - tab system (multiple editors in one leaf)
 * - undo/redo layout
 * - workspace persistence
 * - plugin editors
 */
