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

// navigation anywhere in the app
// router.navigate("/run/physics.mechanics.velocity");
















// simple routing (no framework)
// window.addEventListener('hashchange', renderRoute);

// console.log('the main app')

// renderHome(root);
