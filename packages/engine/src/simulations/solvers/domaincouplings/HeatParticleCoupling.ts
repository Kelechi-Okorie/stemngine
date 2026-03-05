import { Solver } from "../../Interfaces"

class HeatParticleCoupling implements Solver {

    name = "heatCoupling"
    dependencies = ["heat", "particles"]

    step(dt, world) {
        for (p of particles)
            p.color = temperatureToColor(sampleHeat(p.x))
    }
}