FluidPressureSolver = {
    name: "fluid-pressure",

    reads: ["fluid.velocity"],
    writes: ["fluid.pressure"],

    run(world, dt) { ... }
}