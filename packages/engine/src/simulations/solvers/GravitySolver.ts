import { SystemType } from "../Interfaces";
import { Vector3 } from '../../math/Vector3';
import { World } from "../World";
import { ParticleSystem } from '../domains/physics/ParticleSystem';
import { Solver } from "../Interfaces"

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
        'particle.acceleration'
    ]);

    public enabled = true;

    public params = {};

    public step(dt: number, world: World) {

        const ps = world.getSystem(SystemType.ParticleSystem) as ParticleSystem;
        if (!ps) return;

        const particles = ps.particles;

        for (let p of particles) {

            if (p.inverseMass === 0) continue;

            // apply acceleration directly
            p.acceleration.add(this.gravity);

        }
    }

}
