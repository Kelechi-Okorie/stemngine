import { RegisterSolver } from "../../core/SolverRegistry";
import { ExplicitEulerIntegrator } from "./ExplicitEulerIntegrator";

RegisterSolver({
    type: 'integrator',
    name: 'ExplicitEuler',
    category: 'forces',
    create: () => new ExplicitEulerIntegrator()
});
