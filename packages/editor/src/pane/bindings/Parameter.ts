
type Listener<T> = (value: T) => void;

// TODO: may be removed

export class Parameter<T> {

    private _value: T;
    private listeners: Listener<T>[] = [];

    constructor(initial: T) {

        this._value = initial;

    }

    public get value():  T {

        return this._value;

    }

    public set value(v: T){

        if (this._value === v) return;

        this._value = v;

        this.emit();

    }

    public subscribe(fn: Listener<T>) {

        // TODO: remember to unsubscribe
        this.listeners.push(fn);
    }

    private emit() {

        for (const fn of this.listeners) {

            fn(this._value);

        }

    }

}
