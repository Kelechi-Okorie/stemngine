class MicroToMacroTemp /* implements Solver */ {
    name = "micro→macro-temp"
    reads = ["molecular"]
    writes = ["continuum-bar"]

    // step(dt, world) {
    //     for (const obj of world.objects.values()) {
    //         const micro = obj.representations.get("micro")
    //         const macro = obj.representations.get("macro")
    //         if (!micro || !macro) continue

    //         let energy = 0

    //         for (let i = 0; i < micro.velocities.length; i++)
    //             energy += micro.velocities[i] ** 2

    //         const temp = energy / micro.velocities.length

    //         macro.temperature.fill(temp)
    //     }
    // }
}
