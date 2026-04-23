import { Solver } from "../../Interfaces"

export class DistanceConstraintSolver /* implements Solver */ {

    name = "distanceConstraints"
    dependencies = ["particles"]

    // step(dt, world) {
    //     for (c of constraints) {
    //         let delta = p2.x - p1.x
    //         let error = length(delta) - c.restLength
    //         let correction = normalize(delta) * error * 0.5

    //         p1.x += correction
    //         p2.x -= correction
    //     }
    // }
}
