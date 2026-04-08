import { DEP_MAP } from "./ParameterBinding";

const PROXY_CACHE = new WeakMap();

export function makeReactive<T extends object>(obj: T): T {

    // avoid re-wrapping objects
    if (PROXY_CACHE.has(obj)) {

        return PROXY_CACHE.get(obj);

    }

    const proxy = new Proxy(obj, {

        get(target, key, receiver) {

            const value = Reflect.get(target, key, receiver);

            // recursively wrap nested objects
            if (value !== null && typeof value === 'object') {

                return makeReactive(value);

            }

            return value;

        },

        set(target, key, value, receiver) {

            const result = Reflect.set(target, key, value, receiver);

            // notify bindings
            const objMap = DEP_MAP.get(target);
            const bindings = objMap?.get(key as string);

            if (bindings) {

                bindings.forEach(b => b.notify());

            }

            return result;

        }

    });

    PROXY_CACHE.set(obj, proxy);

    return proxy;

}
