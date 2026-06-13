import { matchRoute } from "./matcher";
import { Route, RouteHandler} from './types';

export class Router {

    // NOTE: routes are registered only at boot up phase
    private routes: Route[] = [];

    public register(path: string, handler: RouteHandler) {

        this.routes.push({path, handler});

    }

    public start() {

        window.addEventListener('hashchange', () => this.resolve());

        this.resolve(); // initial load

    }

    public navigate(path: string) {

        window.location.hash = path;

    }

    public back() {

        window.history.back();
        
    }

    private getPath() {

        // TODO: check if correct
        return window.location.hash.slice(1) || "/";

    }

    public resolve() {

        const path = this.getPath();

        for (const route of this.routes) {

            const params = matchRoute(route.path, path);

            if (params) {

                route.handler(params);
                return;

            }

        }

        // should be a modal
        console.warn("No route matched:", path);

    }

}



// Upgrade path (important later)

// You can extend this router without breaking anything:

// 1. Lazy loading
// router.register("/run/:id", async (p) => {
//   const bundle = await loadBundle(p.id);
// });
// 2. Route guards (later)
// router.register("/build/:id", handler, {
//   requiresProgress: true
// });
// 3. Nested layouts (future)
// /app → shell layout
// /run → simulation layout
