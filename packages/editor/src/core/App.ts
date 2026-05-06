import { Editor, EditorContext, Region } from "../Interfaces";
import { ViewportEditor } from "../editors/ViewportEditor";
import { Outliner } from "../editors/Outliner";
import { Properties } from "../editors/Properties";
import { State, StateConfig } from '../core/State';
import { SelectionManager } from "./SelectionManager";
import { Clock, Scene, SimBindingManager, Vector3 } from "@stemngine/engine";
import { SimulationManager } from "./SimulationManager";
import { GlobalEventDispatcher } from "@stemngine/engine";
import { ToolManager } from "../tools/ToolManager";
import { StyleManager } from "./StyleManager";
import { PresentationManager } from "./PresentationManager";
import { RenderIndex } from "./RenderIndex";
import { Renderer3DSystem } from "../renderers/Renderer3DSystem";

export class App {

    private container: HTMLElement;
    private region: Region;
    public state: State;

    private elementMap = new Map<string, HTMLElement>();
    private splitMap = new Map<string, { a: HTMLElement, b: HTMLElement, divider: HTMLElement }>();

    private draggingRegion: Region | null = null;

    private simulationManager: SimulationManager;
    private bindingManager: SimBindingManager;
    // private presentationManager: PresentationManager;

    private clock: Clock;

    private viewports: Set<ViewportEditor> = new Set();

    private isPlaying = false;

    constructor(container: HTMLElement) {

        this.container = container;
        this.bindingManager = new SimBindingManager();

        this.clock = new Clock();

        const stateConfig = {
            scene: new Scene(),
            selectionManager: new SelectionManager(),
            isDragging: false,
            cursor: { position: new Vector3(), visible: true }
        }

        this.state = new State(stateConfig)

        this.simulationManager = new SimulationManager(/* this.bindingManager */);
        const renderIndex = new RenderIndex();

        // this.presentationManager = new PresentationManager(this.state.scene, this.bindingManager);

        const context: EditorContext = {
            simulationManager: this.simulationManager,
            state: this.state,
            toolManager: new ToolManager(),
            styleManager: StyleManager.instance,
            renderIndex,

            select: (id: string) => console.log('test'),
            getSelection: () => console.log('get selection'),

            emit: GlobalEventDispatcher.instance.dispatchEvent.bind(GlobalEventDispatcher.instance),
            on: GlobalEventDispatcher.instance.addEventListener.bind(GlobalEventDispatcher.instance),
        }

        // TODO: find better way tohandle
        const renderer3D = new Renderer3DSystem(context, this.bindingManager);

        const viewport = new ViewportEditor('3D viewport', context);
        this.addViewport(viewport);

        this.region = {
            type: 'split',
            id: 'parent-id',
            direction: 'horizontal',
            ratio: 0.7,
            a: {
                type: 'leaf',
                id: 'a-1',
                name: '3D viewport',
                editor: viewport
            },
            b: {
                type: 'split',
                id: 'b-1',
                direction: 'vertical',
                ratio: 0.3,
                a: { type: 'leaf', id: 'a-2', name: 'outliner', editor: new Outliner('outliner', context) },
                b: { type: 'leaf', id: 'b-2', name: 'properties', editor: new Properties('properties panel', context) }
            }
        }

        requestAnimationFrame(this.loop);

        const btn = document.createElement('button');
        btn.innerText = 'button';
        btn.style.position = 'absolute';
        btn.style.right = '10px'
        btn.style.top = '10px';
        btn.style.cursor = 'pointer';
        btn.style.zIndex = '100';

        // btn.addEventListener('click', () => {
        //     console.log(this.bindingManager);
        //     console.log(this.simulationManager.world)
        // }, false)

        this.container.appendChild(btn);

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
        el.style.padding = '2px';
        el.style.position = 'relative';

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

        this.layout();
    }

    private stopDrag(onMove: (e: MouseEvent) => void, onUp: () => void) {

        this.draggingRegion = null;

        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);

    }

    public addViewport(viewport: ViewportEditor) {

        this.viewports.add(viewport);

    }

    // TODO: check with the engines animation loop
    private loop = () => {

        this.clock.tick();
        const dt = this.clock.dt;

        // 1.simulation - only if playing
        if (this.isPlaying) {

            this.simulationManager.step(dt);

        }

        this.bindingManager.update();

        // 3. render all viewports
        for (const vp of this.viewports) {

            vp.update(dt);
        }

        requestAnimationFrame(this.loop);
    }

    public play() {
        this.isPlaying = true;
    }

    public pause() {
        this.isPlaying = false;
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
