import { System } from "./System";

export type SystemDefinition = {
    id: string;
    name: string;
    create: () => System<any, any>;
}

export class SystemRegistry {

    private static instance: SystemRegistry;

    public static getInstance() {

        if (!this.instance) {

            this.instance = new SystemRegistry();

        }

        return this.instance;

    }

    private definitions = new Map<string, SystemDefinition>();

    public register(def: SystemDefinition) {

        if (this.definitions.has(def.id)) {

            console.warn(`System already registered: ${def.id}`);
            return;
        }

        this.definitions.set(def.id, def);
    }

    public create(id: string): System<any, any> {

        const def = this.definitions.get(id);
        if (!def) throw new Error(`Solver not registered: ${id}`);
        return def.create();

    }

    public getAll() {

        return Array.from(this.definitions.values());

    }

}

export function RegisterSystem(def: SystemDefinition) {

    SystemRegistry.getInstance().register(def);

}
