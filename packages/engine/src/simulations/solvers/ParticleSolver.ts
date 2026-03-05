import { Solver } from "../Interfaces"

export class ParticleSolver implements Solver {

    name = "particles"
    dependencies = []

    step(dt: number, world: any) {
        for (p of world.data.particles) {
            p.v += p.force * dt
            p.x += p.v * dt
        }
    }
}