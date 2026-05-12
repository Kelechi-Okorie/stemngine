import '../solvers/GravitySolver.plugin';
import '../solvers/integrators/ExplicitEulerIntegrator.plugin';
// import '../solvers/integrators/SymplecticEulerIntegrator.plugin';

export function registerBuiltInSolvers() {

    // empty - imports already executed

}

// 🚀 Even better (optional refinement)
// You can make it explicit:
// export function registerEnginePlugins() {
//     registerBuiltInSolvers();
//     registerBuiltInSystems();
//     registerBuiltInRenderers();
// }
// and then editor imports registerEnginePlugins and run it