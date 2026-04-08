import { IBinding, Listener } from "../../Interfaces";

type Key = string;

export const DEP_MAP = new WeakMap<object, Map<Key, Set<IBinding<any>>>>();

export class ParameterBinding<T> implements IBinding<T> {

    private obj: any;
    private key: string;

    private listeners: ((v: T) => void)[] = [];

    constructor(obj: any, key: string) {

        this.obj = obj;
        this.key = key;

        this.register();

    }

    private register() {

        let objMap = DEP_MAP.get(this.obj);

        if (!objMap) {

            objMap = new Map();
            DEP_MAP.set(this.obj, objMap);

        }

        let set = objMap.get(this.key);

        if (!set) {

            set = new Set();
            objMap.set(this.key, set);

        }

        set.add(this);

    }

    public get(): T {

        return this.obj[this.key];

    }

    public set(v: T): void {

        this.obj[this.key] = v; // will trigger Proxy

    }

    public subscribe(fn: Listener<T>): void {
        
        this.listeners.push(fn);

    }

    public notify(): void {

        const v = this.get();

        this.listeners.forEach(fn => fn(v));

    }


    // TODO: may be removed
    // private param: Parameter<T>;

    // constructor(param: Parameter<T>) {

    //     this.param = param;

    // }

    // public get(): T {

    //     return this.param.value;

    // }

    // public set(v: T) {

    //     this.param.value = v;

    // }

    // public subscribe(fn: Listener<T>): void {
        
    //     // TODO: remember to unsubscribe
    //     this.param.subscribe(fn);

    // }

}
