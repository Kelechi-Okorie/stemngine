
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
    destroy(): void;
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
