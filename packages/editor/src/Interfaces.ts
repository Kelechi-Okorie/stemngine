import { SimulationManager } from "./core/SimulationManager";
import { State } from "./core/State";
import { ToolManager } from "./tools/ToolManager";
import { StyleManager } from "./core/StyleManager";
import { SimulationModel } from "@stemngine/engine";

/**
 * future editors
 * 1. graph editor (plot functions)
 * 2. equation editor (symbolic math)
 * 3. table editor (data)
 * 4. timeline editor (simulation timeline)
 * 5. field visualizer (vector/scale fields)
 */
export interface Editor {
    name: string;
    mount(container: HTMLElement): void;
    resize: (width: number, height: number) => void;
    update(state: any): void;   // TODO: this should not be any
    unmount(): void;
}

export type Region =
    | {
        type: 'split'
        id: string;
        direction: 'horizontal' | 'vertical';
        ratio: number;  // 0 -> 1
        a: Region;
        b: Region;
        // _wrapperA: HTMLElement;
        // _wrapperB: HTMLElement;
    }
    | {
        type: 'leaf';
        id: string;
        name: string;
        editor: Editor;
        // _wrapper: HTMLElement;   // store reference for layout
    }

export type Listener<T> = (value: T) => void;

export interface IBinding<T> {
    get(): T;
    set(v: T): void;
    subscribe(fn: Listener<T>): void;
    notify(): void;
};

export const LAYERS = {
  DEFAULT: 0,
  HELPERS: 1,
  GIZMOS: 2
};

export interface Tool {
    name: string;
    icon: string;
    btn: HTMLElement;
    onMouseDown?: (e: MouseEvent, obj: any) => void;
    onMouseMove?: (e: MouseEvent, obj: any) => void;
    onMouseUp?: (e: MouseEvent, obj: any) => void;
    onClick?: (e: MouseEvent, obj: any) => void;
};

export interface EditorContext {
    simulationManager: SimulationManager,
    state: State,
    toolManager: ToolManager;
    styleManager: StyleManager;

    select(id: string): void;
    getSelection(): any;

    on(event: string, handler: Function): void; // TODO: change Function
    emit(event: string, payload?: any): void;
}

export type VisualRepresentation = {
    id: string;
    entityId: string;   // TODO: will be removed
    entity: Entity;
    kind: 'point' | 'vector' | 'trajectory';    // TODO: to be removed
    color?: number;
    size?: number;
}

export type RendererCapability = {
    supports: {
        kinds: string[];
    };

    create: (rep: VisualRepresentation, entity: any) => any;
    update?: (rep: VisualRepresentation, entity: any, visual: any) => void;
    remove?: (visual: any) => void;
}

export type Entity = SimulationModel;
