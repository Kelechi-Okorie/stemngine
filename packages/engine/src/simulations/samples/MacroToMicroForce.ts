class MacroToMicroForce implements Solver {
    name = "macro→micro-force"
    reads = ["continuum-bar"]
    writes = ["molecular"]

    step(dt, world) {
        for (const obj of world.objects.values()) {
            const micro = obj.representations.get("micro")
            const macro = obj.representations.get("macro")
            if (!micro || !macro) continue

            const avgStrain =
                macro.strain.reduce((a,b)=>a+b,0)/macro.strain.length

            for (let i = 0; i < micro.forces.length; i++)
                micro.forces[i] += avgStrain
        }
    }
}