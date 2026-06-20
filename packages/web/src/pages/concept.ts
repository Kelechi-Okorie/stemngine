import { loadBundle } from "../services/api";

export async function renderConcept(id: string) {

    const root = document.getElementById("root")!;
    root.innerHTML = "Loading...";

    const data = await loadBundle(id);
    const { concept, bundle } = data.data;
    const { explores } = bundle;

    console.log("data:", data); // TODO: to be removes

    root.innerHTML = "";

    const container = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = concept.name;

    const section = createExploreSection(explores)

    container.appendChild(title);
    container.appendChild(section);

    root.appendChild(container);

}

/**
 * Build section
 * 
 * @returns 
 */
function createExploreSection(explores: any[]) {

    const section = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = "Build projects";

    for (const explore of explores) {

        const link = document.createElement('a');
        link.textContent = explore.name;
        link.href = `#/run/${explore.id}`;

        section.appendChild(link);
        console.log(explore);

    }

    // const link = document.createElement('a');
    // link.textContent = "Resume Projectile Motion";

    // // important: use hash
    // link.href = "#/run/physics.mechanics.gravity.concept";

    // section.appendChild(title);
    // section.appendChild(link);

    return section;
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
