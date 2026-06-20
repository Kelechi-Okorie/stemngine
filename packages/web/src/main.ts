import { router } from './router/routerInstance';
import { registerRoutes } from './routes';

const root = document.getElementById("root");

if (root === null) {

    throw new  Error('root container does not exist');

}

// register routes
registerRoutes();

router.start();
router.navigate("/");


// CONCEPT
//    ↓
// SCENE (simulation)
//    ↓
// ENGINE STATE
//    ↓
// OBSERVATIONS
//    ↓
// ASSETS (GLTF, meshes)
//    ↓
// BINDINGS (state → asset)
//    ↓
// RENDERER
