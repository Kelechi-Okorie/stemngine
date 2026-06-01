
export enum SelectionEventType {
    SELECTION_CHANGED = 'selection:changed'
};


export class SelectionManager {

    private _selected: any = null;
    private listeners: ((obj: any) => void)[] = [];

    public set(obj: any) {

        this._selected = obj;
        this.emit();

    }

    public get() {

        return this._selected;

    }

    public subscribe(fn: (obj: any) => any) {

        this.listeners.push(fn);

    }

    private emit() {

        for (const fn of this.listeners) {

            fn(this._selected);

        }

    }

    public clear(): void {

        this._selected = null;
        this.emit();
    }

}
