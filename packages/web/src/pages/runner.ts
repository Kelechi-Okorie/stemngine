import { loadBundle } from "../services/api";

// Your service worker can manage an IndexedDB artifact store while still providing the same Docker-like behavior

// ----------------------------------
// [ Top Bar: Title / Mode ]

// ----------------------------------
// |                                |
// |        VIEWPORT (engine)       |
// |                                |
// ----------------------------------
// | Controls | Instructions | Goals |
// ----------------------------------

// if (mode === "lesson") {
//   showInstructions();
//   showGoals();
//   lockControls();
// }

// if (mode === "explore") {
//   hideInstructions();
//   hideGoals();
//   unlockAllControls();
// }

// if (mode === "build") {
//   showConstraints();
//   showGoals();
// }



// Then your service worker becomes a package manager

// It is no longer "just a cache."

// It becomes responsible for:

// checking cache
// downloading artifacts
// verifying versions or hashes
// storing artifacts
// deleting old versions if desired

// That's much closer to how serious software distribution works.

// One suggestion

// I would avoid localStorage for storing artifacts.

// localStorage is synchronous, relatively small, and not well suited for storing many JSON documents or binary assets. Since you're talking about concepts, worlds, lessons, meshes, textures, audio, and eventually many hundreds or thousands of artifacts, IndexedDB is a much better fit. Your service worker can manage an IndexedDB artifact store while still providing the same Docker-like behavior.

export async function renderRunner(id: string) {

    console.log(id)

    const root = document.getElementById("root")!;
    root.innerHTML = "Loading...";

    const data = await loadBundle(id);

    console.log("BUNDLE:", data); // TODO: to be removes

    root.innerHTML = "";

    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = `Running: ${id}`;

    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(data, null, 2);

    container.appendChild(title);
    container.appendChild(pre);

    root.appendChild(container);

}

// TODO: to be removed
// renderer
{
    const observations: any[] = [];

    const resolve = (a: any) => a;
    const loadAsset = (a: any) => a;
    const applyBinding = (a: any, b: any) => b;

    for (const observation of observations) {

        const data = resolve(observation.source);
        const asset = loadAsset(observation.visualization.assetId);

        applyBinding(asset, data);

        // return asset;
    }
}



















// 8. Now the heart becomes implementable
// Asset
// asset.heart = GLTF mesh (rest shape)
// Simulation produces:
// {
//   activationField: "electrical wave across myocardium",
//   pressureField: "blood pressure inside chambers"
// }
// Deformation model:
// {
//   type: "field",

//   source: ["activationField", "pressureField"],

//   apply: [
//     {
//       type: "vertexShader",
//       shaderId: "heartBeatShader",
//       uniforms: {
//         activation: "activationField",
//         pressure: "pressureField"
//       }
//     }
//   ]
// }

// Result:
// muscle contracts where activation wave passes
// chambers expand under pressure
// heart “beats” visually

// 9. So how does ANY asset behave?
// General rule:
// An asset behaves by mapping simulation fields → geometric transformations
// There are only 3 universal cases:
// CASE 1: Rigid object
// single state → transform
// CASE 2: Articulated object
// state → bones → mesh
// CASE 3: Deformable object (heart, cloth, fluid surfaces)
// fields → vertex deformation

// 10. Why your system now makes sense
// Your architecture becomes:
// Concept
//   ↓
// Simulation Scene
//   ↓
// State (fields + particles)
//   ↓
// Deformation Models   ← THIS IS THE KEY MISSING PIECE
//   ↓
// Assets (GLTF)
//   ↓
// Renderer

// 11. The important realization
// You were previously trying to solve:
// “How do I attach visuals to physics?”
// But the real problem is:
// “How do I define different kinematic interpretations of simulation data?”
// Because:
// particle motion = kinematic transform
// heart = field-driven deformation
// fluid = continuous mesh deformation

// 13. Direct answer to your question
// “How does an arbitrary asset behave according to simulation?”
// It behaves through:
// a DeformationModel that maps simulation outputs (state/fields) → geometric transformations (mesh, bones, vertices, shaders)

// 14. If you want next step
// The next critical design is:
// designing a standard field system (so physics, biology, chemistry all output compatible “fields”)
// That is what will unify:
// gravity
// blood flow
// heat
// neural signals
// into one consistent engine.




// One more subtle issue (important)

// This:

// "target": "p1.velocity"

// is too raw.

// Better:
// "target": {
//   "type": "entity",
//   "id": "p1",
//   "property": "velocity"
// }
