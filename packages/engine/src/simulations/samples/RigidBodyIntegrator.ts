RigidBodyIntegrateSolver = {
    name: "rigid-integrate",

    reads: ["rigidBodies.forces", "rigidBodies.velocity"],
    writes: ["rigidBodies.position"],

    run(world, dt) { ... }
}