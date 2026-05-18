import { Solver } from "../Interfaces";

export type SolverDefinition = {
    type: string;
    name: string;
    category?: string;
    create: () => Solver;
}

export class SolverRegistry {

    private static instance: SolverRegistry;

    public static getInstance() {

        if (!this.instance) {

            this.instance = new SolverRegistry();

        }

        return this.instance;

    }

    private definitions = new Map<string, SolverDefinition>();

    public register(def: SolverDefinition) {

        if (this.definitions.has(def.type)) {

            console.warn(`Solver already registered: ${def.type}`);
            return;
        }

        this.definitions.set(def.type, def);
    }

    // TODO: type may not be best for creating. it may not be unique
    public create(type: string): Solver {

        const def = this.definitions.get(type);
        if (!def) throw new Error(`Solver not registered: ${type}`);
        return def.create();

    }

    public getAll() {

        return Array.from(this.definitions.values());

    }

}

export function RegisterSolver(def: SolverDefinition) {

    SolverRegistry.getInstance().register(def);

}
