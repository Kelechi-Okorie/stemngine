// import { openEntry } from "../router";
import { router } from "../router/routerInstance";

/**
 * This is not a component-based UI
 * This is a runtime-driven DOM renderer
*/


export function renderHome(/* root: HTMLElement */) {

    const root = document.getElementById('root')!;

    root.innerHTML = "";

    const container = document.createElement('div');

    container.appendChild(createContinueSection());
    // container.appendChild(createExploreSession());
    // container.appendChild(createBuildSection());

    root.appendChild(container);

}

/**
 * Continue section
 * 
 * @returns 
 */
function createContinueSection() {

    const section = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = "Continue Learning";

    const button = document.createElement('button');
    button.textContent = "Resume Projectile Motion";

    button.onclick = () => {

        // router.navigate("/run/physics.mechanics.velocity");
        router.navigate("/run/physics.mechanics.gravity.concept");

    };

    section.appendChild(title);
    section.appendChild(button);

    return section;
}
