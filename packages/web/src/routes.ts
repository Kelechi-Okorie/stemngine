import { router } from "./router/routerInstance";
import { renderHome } from "./pages/home";
import { renderRunner } from "./pages/runner";

export function registerRoutes() {

    // NOTE: routes are registered only at boot up phase
    router.register("/", () => renderHome());
    
    router.register("/run/:id", ({id}) => {
        renderRunner(id);
    });
    
}
