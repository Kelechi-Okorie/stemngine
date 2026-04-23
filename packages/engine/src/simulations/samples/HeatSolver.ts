class HeatSolver {
    name = "heat"
    reads = ["continuum-bar"]
    writes = ["continuum-bar"]

    // step(dt, world) {
    //     for (const obj of world.objects.values()) {
    //         const bar = obj.representations.get("macro")
    //         if (!bar) continue

    //         for (let i = 0; i < bar.temperature.length; i++)
    //             bar.temperature[i] += 0.1 * dt
    //     }
    // }
}
