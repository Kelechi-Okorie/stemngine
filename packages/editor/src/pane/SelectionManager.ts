
export class SelectionManager {

    private selected: any = null;
    private listeners: ((obj: any) => void)[] = [];

    public set(obj: any) {

        this.selected = obj;
        this.emit();

    }

    public get() {

        return this.selected;

    }

    public subscribe(fn: (obj: any) => any) {

        this.listeners.push(fn);

    }

    private emit() {

        for (const fn of this.listeners) {

            fn(this.selected);

        }

    }

}
