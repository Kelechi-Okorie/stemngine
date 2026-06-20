import { router } from "./router/routerInstance";
import { renderHome } from "./pages/home";
import { renderRunner } from "./pages/runner";
import { renderConcept } from "./pages/concept";

// link.href = "#/run/physics.mechanics.gravity.concept";
// router.navigate("/run/physics.mechanics.velocity");

export function registerRoutes() {

    // NOTE: routes are registered only at boot up phase
    router.register("/", () => renderHome());

    router.register("/concept/:id", ({id}) => {
        renderConcept(id);
    });

    router.register("/run/:id", ({ id }) => {
        renderRunner(id);
    });

}
