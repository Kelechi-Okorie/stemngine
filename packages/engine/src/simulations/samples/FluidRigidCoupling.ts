FluidRigidCoupler = {
    name: "fluid→rigid",

    reads: ["fluid.pressure", "rigidBodies.surface"],
    writes: ["rigidBodies.forces"],

    run(world, dt) { ... }
}