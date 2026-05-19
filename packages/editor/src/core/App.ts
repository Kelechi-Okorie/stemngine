import { Context, Region } from "../Interfaces";
import { State } from '../core/State';
import { SelectionManager } from "./SelectionManager";
import { Scene, SimBindingManager, Vector3 } from "@stemngine/engine";
import { SimulationManager } from "./SimulationManager";
import { GlobalEventDispatcher } from "@stemngine/engine";
import { ToolManager } from "../tools/ToolManager";
import { StyleManager } from "./StyleManager";
import { RenderIndex } from "./RenderIndex";
import { Renderer3DSystem } from "../renderers/Renderer3DSystem";
import { SimulationRuntime } from "./SimulationRuntime";
import { registerBuiltInSolvers } from "@stemngine/engine";
import { exportDefinition } from "../io/exportDefinition";
import { buildRegion } from "../editors/templates/registry";
import { templates } from "../editors/templates/registry";
import { TemplateNode } from "../Interfaces";
import { importDefinition } from "../io/importDefinition";
import { RepresentationStoreEventType } from "./RepresentationStore";
import rootStyle, { rootClass } from '../assets/css/rootStyle';
// import { InteractionManager } from "./InteractionManager";

// Correct structure
// Think of your UI like this:
// APP SHELL
// ├── Top Bar (global controls)
// ├── Main Area (welcome / editor / player)
// └── Optional overlays (modals, loaders)

type AppMode =
    | { type: 'welcome' }
    | { type: 'editor'; region: Region }
    | { type: 'player'; simulation: any }
    ;

// Your new app lifecycle
// Now it becomes:
// BOOT
//  ↓
// WELCOME SCREEN
//  ↓
// New Project → buildRegion(template)
//  ↓
// EDITOR MODE
//  ↓
// (optional) PLAYER MODE

export class App {

    private mode!: AppMode;
    private host: HTMLElement;
    private root: HTMLElement;  // app container
    private container: HTMLElement;
    private header!: HTMLElement;
    public region!: Region;

    public state: State;

    private elementMap = new Map<string, HTMLElement>();
    private splitMap = new Map<string, { a: HTMLElement, b: HTMLElement, divider: HTMLElement }>();

    private context: Context;

    private draggingRegion: Region | null = null;

    public simulationManager: SimulationManager;
    private bindingManager: SimBindingManager;
    private simulationRuntime: SimulationRuntime;
    // private interactions: InteractionManager;

    private renderer3D: Renderer3DSystem;

    constructor(host: HTMLElement) {

        // Renderer3DSystem (scene objects)
        // SimBindingManager (live bindings)
        // RenderIndex (mesh registry)
        // SimulationRuntime (update loop)
        // UI state (region tree, DOM cache)
        // SelectionManager state
        // ToolManager state (likely)

        host.addEventListener('contextmenu', (e) => {

            e.preventDefault();

        });

        this.host = host;

        const shadow = host.attachShadow({ mode: 'open' }); // isolation boundary

        const styleManager = new StyleManager(shadow);
        styleManager.registerStyle(rootClass, rootStyle)

        this.root = document.createElement('div');
        this.root.classList.add(rootClass);
        shadow.appendChild(this.root);


        this.createHeader();
        this.header.style.height = '40px';
        this.header.style.flexShrink = '0';

        const container = document.createElement('div');
        container.style.flex = '1';
        container.style.minHeight = '0';
        this.container = container;

        this.root.appendChild(this.container);

        this.initApp();

        this.bindingManager = new SimBindingManager();

        const stateConfig = {
            scene: new Scene(),
            selectionManager: new SelectionManager(),
            isDragging: false,
            cursor: { position: new Vector3(), visible: true }
        }

        this.state = new State(stateConfig)

        this.simulationManager = new SimulationManager();
        this.simulationRuntime = new SimulationRuntime(this.simulationManager, this.bindingManager);
        const renderIndex = new RenderIndex();
        // this.interactions = new InteractionManager();

        // this.root.addEventListener('pointerdown', this.onGlobalPointerDown);

        this.context = {
            simulationManager: this.simulationManager,
            simulationRuntime: this.simulationRuntime,
            state: this.state,
            toolManager: new ToolManager(),
            styleManager,
            renderIndex,
            // interactions: this.interactions,

            // TODO: may be removed
            // select: (id: string) => console.log('test'),
            // getSelection: () => console.log('get selection'),

            // emit: GlobalEventDispatcher.instance.dispatchEvent.bind(GlobalEventDispatcher.instance),
            // on: GlobalEventDispatcher.instance.addEventListener.bind(GlobalEventDispatcher.instance),
        }

        this.renderer3D = new Renderer3DSystem(this.context, this.bindingManager);

        // Final mental model
        // You now have a pipeline:
        // Template (pure data)
        //         ↓
        // buildRegion()
        //         ↓
        // Runtime Layout (with editors)
        //         ↓
        // render() + layout()
        // That’s clean architecture.

        // this.region = buildRegion(templates.default, this.context);

        // TODO: find better way to handle

        // this.setMode({type: 'editor', region: buildRegion(templates.default, this.context)});


        const btn = document.createElement('button');
        btn.innerText = 'button';
        btn.style.position = 'absolute';
        btn.style.right = '10px'
        btn.style.top = '10px';
        btn.style.cursor = 'pointer';
        btn.style.zIndex = '100';

        btn.addEventListener('click', () => {

            console.log(this)
        }, false);

        const body = document.querySelector('body')!;
        body.appendChild(btn)




    }

    public bootstrap() {

        // register solver plugins  TODO: what of built in systems
        registerBuiltInSolvers();

        this.simulationRuntime.run();

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

        this.container.innerHTML = '';

        this.renderHeader();

        if (this.mode.type === 'welcome') {

            this.renderWelcome();
            return;

        }

        if (this.mode.type === 'editor') {

            this.region = this.mode.region;
            this.renderRegion(this.region, this.container);
            return;

        }

        if (this.mode.type === 'player') {

            // TODO: later
            return;

        }

    }

    public layout() {

        if (this.mode.type !== 'editor') return;

        const { width, height } = this.getContainerSize();
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

        container.classList.add('container');

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
        // a.style.flex = `${region.ratio} 1 0`;
        // b.style.flex = `${1 - region.ratio} 1 0`;

        // const dividerSize = 4; // px

        // if (region.direction === 'horizontal') {
        //     a.style.flex = `0 0 calc(${region.ratio * 100}% - ${dividerSize / 2}px)`;
        //     b.style.flex = `0 0 calc(${(1 - region.ratio) * 100}% - ${dividerSize / 2}px)`;
        // } else {
        //     a.style.flex = `0 0 calc(${region.ratio * 100}% - ${dividerSize / 2}px)`;
        //     b.style.flex = `0 0 calc(${(1 - region.ratio) * 100}% - ${dividerSize / 2}px)`;
        // }

        const divider = this.createDivider(region)!;

        wrapper.style.display = 'flex';

        a.style.flex = '1';
        b.style.flex = '1';

        // divider.style.flex = '0 0 4px';

        a.style.minWidth = '0';
        b.style.minWidth = '0';

        a.style.flexGrow = `${region.ratio}`;
        b.style.flexGrow = `${1 - region.ratio}`;

        a.style.margin = '2px'
        b.style.margin = '2px'


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
        el.style.border = '1px solid grey';
        el.style.borderRadius = '16px;'

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

        const wrapper = split.a.parentElement;

        if (wrapper === null) {

            throw new Error('wrapper is null');

        }

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

    private renderWelcome() {

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.justifyContent = 'center';
        wrapper.style.alignItems = 'center';
        wrapper.style.height = '100%';
        wrapper.style.gap = '12px';

        const title = document.createElement('h1');
        title.innerText = 'STEMngine';

        const newBtn = document.createElement('button');
        newBtn.innerText = 'New Project';

        const openBtn = document.createElement('button');
        openBtn.innerText = 'Open Project';

        const simBtn = document.createElement('button');
        simBtn.innerText = 'Open Simulation';

        newBtn.onclick = () => {

            this.loadEditor(templates.default);
        };

        openBtn.onclick = () => {

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,appliaction/json';

            input.onchange = async (event) => {

                const file = (event.target as HTMLInputElement).files?.[0];
                if (!file) return;

                const text = await file.text();
                const json = JSON.parse(text);

                importDefinition(this, json);
                this.buildRepresentationsFromSimulation()

                // this.loadEditor(templates.default);

            }

            input.click();

        }

        // TODO: Bonus(high - value upgrade)
        // You can also add drag & drop:

        // this.container.ondrop = async (e) => {
        //     e.preventDefault();

        //     const file = e.dataTransfer?.files?.[0];
        //     if (!file) return;

        //     const text = await file.text();
        //     const json = JSON.parse(text);

        //     this.loadEditorFromSimulation(json);
        // };

        simBtn.onclick = () => {

            console.log('TODO: simulate - may be removed later');

        }

        wrapper.appendChild(title);
        wrapper.appendChild(newBtn);
        wrapper.appendChild(openBtn);
        wrapper.appendChild(simBtn);

        this.container.appendChild(wrapper);

    }

    public loadEditor(template: TemplateNode) {

        const region = buildRegion(template, this.context);

        this.mode = {
            type: 'editor',
            region
        };

        this.render();
        this.layout();
    }

    private initApp() {

        this.mode = { type: 'welcome' };

    }

    private setMode(mode: AppMode) {

        this.mode = mode;
        this.render();

        requestAnimationFrame(() => {
            this.layout();
        });

    }

    private createHeader() {
        this.header = document.createElement('div');
        this.header.style.height = '40px';
        this.header.style.display = 'flex';
        this.header.style.alignItems = 'center';
        this.header.style.justifyContent = 'space-between';
        this.header.style.padding = '0 10px';
        this.header.style.borderBottom = '1px solid #333';

        this.root.appendChild(this.header);

    }

    private renderHeader() {
        this.header.innerHTML = '';

        const left = document.createElement('div');
        const right = document.createElement('div');

        // App name / logo
        const title = document.createElement('span');
        title.innerText = 'STEMngine';

        left.appendChild(title);

        // Buttons depend on mode
        if (this.mode.type === 'editor') {

            const home = document.createElement('button');
            home.innerText = 'Home';

            home.onclick = () => {

                this.setMode({ type: 'welcome' });
                this.reset();
                this.render();

            }

            const newBtn = document.createElement('button');
            newBtn.innerText = 'New';

            newBtn.onclick = () => {

                // const region = buildRegion(templates.default, this.context);

                // this.setMode({
                //     type: 'editor',
                //     region
                // })

                window.open(window.location.href, '_blank');

            }

            const exportBtn = document.createElement('button');
            exportBtn.innerText = 'Export';

            exportBtn.onclick = () => {

                const file = exportDefinition(this);  // definition

                const json = JSON.stringify(file, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = 'simulation.json'; // or dynamic name
                a.click();

                URL.revokeObjectURL(url);

            }

            left.appendChild(home);
            left.appendChild(newBtn);
            left.appendChild(exportBtn);
        }

        if (this.mode.type === 'player') {

            const exit = document.createElement('button');
            exit.innerText = 'Exit Player';
            exit.onclick = () => this.renderWelcome();

            left.appendChild(exit);
        }

        right.innerText = 'v0.1'; // later: project name, save status, etc.

        this.header.appendChild(left);
        this.header.appendChild(right);
    }

    private getContainerSize(): { width: number, height: number } {
        return {
            width: this.container.clientWidth,
            height: this.container.clientHeight
        };
    }

    // Return the entire application to a clean editor state without reloading the page.
    private reset() {

        // runtime reset
        this.simulationRuntime.reset();

        // 1. reset simulation
        this.simulationManager.reset();

        // 2. renderer cleanup
        this.bindingManager.clear();

        // 3. renderer mappings
        this.context.renderIndex.reset();
        this.renderer3D.reset();

        // 4. UI cleanup state
        this.elementMap.clear();
        this.splitMap.clear();
        this.container.innerHTML = '';

        // You also need:
        // stop dragging state
        // clear region tree
        // reset mode (optional)

        // 5. selection + tools reset
        this.state.selectionManager.clear();
        this.context.toolManager.reset();

        // Big-picture insight (this is the important part)
        // Your App is currently acting as:
        // a manual orchestrator of multiple subsystems
        // But it should evolve into:
        // a lifecycle manager (like Unity “scene reload”)
        // So eventually your reset becomes:
        // reset() {
        //     disposeScene();
        //     recreateRuntime();
        //     rebuildUI();
        // }

    }

    private buildRepresentationsFromSimulation() {

        const entities = this.simulationManager.getAllEntities();

        for (const entity of entities) {

            GlobalEventDispatcher.instance.dispatchEvent({
                type: RepresentationStoreEventType.REPRESENTATION_SET,
                representation: {
                    id: entity.uuid,
                    kind: 'point',  // TODO: or derive from entity type
                    entity,
                    color: 0xffff00,
                    size: 1
                }
            });
        }

        // Better long-term design (VERY important)
        // Right now you're manually rebuilding representations.
        // You should evolve to:
        // 👉 RepresentationStore as source of truth
        // Instead of dispatching events directly, do:
        // representationStore.set({
        //     id,
        //     kind,
        //     entity
        // });
        // Then:
        // store emits event
        // renderer reacts
        // 🧠 Even better: automatic sync
        // Eventually you want:
        // simulationManager.onEntityAdded → auto-create representation
        // So import automatically populates visuals.

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

    // private onGlobalPointerDown = (e: PointerEvent) => {

    //     // 1. check overlays first
    //     if (this.interactions.isInsideOverlay(e)) {
    //         return;
    //     }

    //     // 2. close all overlays safely
    //     this.closeAllOverlays();

    // };

    // private closeAllOverlays() {
    //     // you implement this based on your system
    //     this.closeMenu();
    //     // this.closeInspector();
    //     // this.closeTooltips();
    // }

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
