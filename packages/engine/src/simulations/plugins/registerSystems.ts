import '../systems/ParticleSystem.plugin';

export function registerBuiltInSystems() {

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