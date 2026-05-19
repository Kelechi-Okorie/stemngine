import { SimulationManager } from "./core/SimulationManager";
import { State } from "./core/State";
import { ToolManager } from "./tools/ToolManager";
import { StyleManager } from "./core/StyleManager";
import { SimulationModel } from "@stemngine/engine";
import { RenderIndex } from "./core/RenderIndex";
import { SimulationRuntime } from "./core/SimulationRuntime";
import { System } from "@stemngine/engine";
import { editorRegistry } from "./editors/templates/registry";

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

export type TemplateNode =
    | {
        type: 'leaf';
        name: string;
        editorType: keyof typeof editorRegistry;
    }
    | {
        type: 'split';
        direction: 'horizontal' | 'vertical';
        ratio: number;
        a: TemplateNode;
        b: TemplateNode;
    }
    ;


export type Region =
    | {
        type: 'split'
        id: string;
        direction: 'horizontal' | 'vertical';
        ratio: number;  // 0 -> 1
        a: Region;
        b: Region;
    }
    | {
        type: 'leaf';
        id: string;
        name: string;
        editor: Editor;
        editorType: keyof typeof editorRegistry;
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
    allows: Record<string, boolean>
    onMouseDown?: (e: MouseEvent, obj: any) => void;
    onMouseMove?: (e: MouseEvent, obj: any) => void;
    onMouseUp?: (e: MouseEvent, obj: any) => void;
    onClick?: (e: MouseEvent, obj: any) => void;
};

export interface Context {
    simulationManager: SimulationManager,
    simulationRuntime: SimulationRuntime,
    state: State,
    toolManager: ToolManager;
    styleManager: StyleManager;
    renderIndex: RenderIndex,

    // TODO: may be removed
    // select(id: string): void;
    // getSelection(): any;

    // on(event: string, handler: Function): void; // TODO: change Function
    // emit(event: string, payload?: any): void;
}

export type VisualRepresentation = {
    id: string;
    entityId: string;
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

export interface Inspector {

    id: string;
    name: string;
    icon: string;

    // when should this inspector be visible?
    // isAvailable(context: {id: string, name: string, render: () => void): boolean;

    onClick(): void;

    // render UI
    render(selected?: any): void;
}

// io/types.ts

export type SimulationDefinition = {
    id: string;

    meta?: {
        name?: string
        version?: string
    };

    systems: {id: string, entities: Entity[]}[];
    // solvers: {type: string}[],
    solvers: Record<string, any>,
    regionTemplate: TemplateNode

}
