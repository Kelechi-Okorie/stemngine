class MolecularIntegrator/*  implements Solver */ {
    name = "molecular-integrator"
    reads = ["molecular"]
    writes = ["molecular"]

    // step(dt, world) {
    //     for (const obj of world.objects.values()) {
    //         const mol = obj.representations.get("micro")
    //         if (!mol) continue

    //         for (let i = 0; i < mol.positions.length; i++) {
    //             mol.velocities[i] += mol.forces[i] * dt
    //             mol.positions[i] += mol.velocities[i] * dt
    //         }
    //     }
    // }
}
