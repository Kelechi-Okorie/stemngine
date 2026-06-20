/**
 * This is not a component-based UI
 * This is a runtime-driven DOM renderer
*/

// Explore (free interaction)
// Lessons (guided understanding)
// Builds (applied / real-world usage)

export function renderHome() {

    const root = document.getElementById('root')!;

    root.innerHTML = "";

    const container = document.createElement('div');

    const h1 = document.createElement('h1');
    h1.textContent = 'Welcome back';

    container.appendChild(h1);

    container.appendChild(createContinueSection());
    container.appendChild(createExploreSection());
    container.appendChild(createBuildSection());

    const link = document.createElement('a');
    link.textContent = 'Velocity';
    link.href = "#/concept/concept:velocity";

    const link2 = document.createElement('a');
    link2.textContent = 'hash';
    link2.href = "#/";

    container.appendChild(link);
    container.appendChild(link2);
    root.appendChild(container);

}

/**
 * Continue lesson/learning
 * 
 * @returns 
 */
function createContinueSection() {

    const section = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = "Continue Learning";

    const link = document.createElement('a');
    link.textContent = "Resume Projectile Motion";

    // important: use hash
    link.href = "#/run/physics.mechanics.velocity.concept";

    section.appendChild(title);
    section.appendChild(link);

    return section;
}

/**
 * explore section
 * 
 * @returns 
 */
function createExploreSection() {

    const section = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = "Explore concepts";

    const link = document.createElement('a');
    link.textContent = "Resume Projectile Motion";

    // important: use hash
    link.href = "#/run/physics.mechanics.gravity.concept";


    section.appendChild(title);
    section.appendChild(link);

    return section;
}
/**
 * Build section
 * 
 * @returns 
 */
function createBuildSection() {

    const section = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = "Build projects";

    const link = document.createElement('a');
    link.textContent = "Resume Projectile Motion";

    // important: use hash
    link.href = "#/run/physics.mechanics.gravity.concept";

    section.appendChild(title);
    section.appendChild(link);

    return section;
}
