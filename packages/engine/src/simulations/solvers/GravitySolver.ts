import { Vector3 } from '../../math/Vector3';
import { World } from "../World";
import { Solver } from "../Interfaces"
import { System } from "../core/System";

let _id = 0;

export class GravitySolver implements Solver {

    public readonly id = `gravity-solver-${_id++}`;
    public readonly type = "gravity";

    public readonly name: string = 'Gravity';

    private gravity = new Vector3(0, -9.81, 0);

    // TODO: why set, may be too slow
    public readonly reads: Set<string> = new Set();

    // TODO: why set, may be too slow
    public readonly writes: Set<string> = new Set([
        'acceleration'
    ]);

    public enabled = true;

    public scope = {
        type: "query",
        filter: (system: System<any, any>) => system.capabilities.has('mass')
    } as const;

    public params = {};

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

}

// params = {
//     gravityY: {
//         value: -9.81,
//         min: -50,
//         max: 0,
//         step: 0.1,
//         label: "Gravity"
//     }
// };

// step(dt, world) {
//     const g = this.params.gravityY.value;

//     for (const p of particles) {
//         p.addForce(new Vector3(0, g, 0));
//     }
// }

// 🧩 Now your UI becomes automatic
// Your Properties panel can:
// for (let key in solver.params) {
//     const param = solver.params[key];

//     createSlider({
//         label: param.label,
//         min: param.min,
//         max: param.max,
//         value: param.value,
//         onChange: (v) => param.value = v
//     });
// }

// No custom UI per solver needed.
