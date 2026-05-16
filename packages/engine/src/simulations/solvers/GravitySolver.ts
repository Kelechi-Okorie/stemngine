import { Vector3 } from '../../math/Vector3';
import { World } from "../World";
import { FieldSchema, Solver, SolverScope } from "../Interfaces";
import { System } from "../core/System";

let _id = 0;

export type GravityExport = {
    name: string;
    type: string;
    enabled: boolean;
    gravity: number[];
}

export class GravitySolver implements Solver {

    public readonly id = `gravity-solver-${_id++}`;
    public readonly type = "gravity";
    public readonly name: string = 'Gravity';

    public enabled = true;

    private gravity = new Vector3(0, -9.81, 0);

    // TODO: why set, may be too slow
    public readonly reads = new Set<string>();

    // TODO: why set, may be too slow
    public readonly writes = new Set<string>(['acceleration']);

    public scope: SolverScope = {
        type: "query",
        filter: (system: System<any, any>) => system.capabilities.has('mass')
    };

    public schema: FieldSchema[] = [
        {
            type: "boolean",
            key: "enabled",
            label: "Enabled"
        },
        {
            type: "vector3",
            key: "gravity",
            label: "Gravity",
            fields: {
                y: {
                    type: "number",
                    key: "gravity.y",
                    label: "value"
                }
            }
        }
    ];

    public step(dt: number, systems: System<any, any>[], world: World) {

        for (const system of systems) {

            const entities = system.entities;

            for (const entity of entities) {

                if (entity.inverseMass === 0) continue;

                // apply acceleration directly
                entity.acceleration.add(this.gravity);
            }

        }

    }

    public export(): GravityExport {

        return {
            name: this.name,
            type: this.type,
            enabled: this.enabled,
            gravity: this.gravity.toArray()
        };

    }

    /**
     * 
     * `js
     * const g = new Gravity().import(config);
     * `
     * @param config 
     */
    public import(config: Record<string, any>): void {

        const { enabled, gravity } = config;

        this.enabled = enabled;
        this.gravity = new Vector3().fromArray(gravity);
    }

}
