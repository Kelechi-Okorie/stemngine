type Listener<T> = (v: T) => void;

interface IBinding<T> {
    get(): T;
    set(v: T): void;
    subscribe(fn: Listener<T>): void;
}

// TODO: may be removed

export class ObjectBinding<T> implements IBinding<T> {

    private targetObject: any;
    private propertyName: string;

    private listeners: Listener<T>[] = [];

    constructor(targetObject: any, propertyName: string) {

        this.targetObject = targetObject;
        this.propertyName = propertyName;

    }

    public get(): T {

        return this.targetObject[this.propertyName];

    }

    public set(v: T) {

        this.targetObject[this.propertyName] = v;
        
        this.emit();

    }

    public subscribe(fn: Listener<T>): void {

        // TODO: remember to remove
        this.listeners.push(fn);
    }

    private emit() {

        for (const fn of this.listeners) {

            // fn(this._value);
            // TODO: naive - should store and compare with old value
            fn(this.targetObject[this.propertyName]);

        }

    }

}
