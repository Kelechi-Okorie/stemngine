import { RegisterSolver } from "../../core/SolverRegistry";
import { SymplecticEulerIntegrator } from "./SymplecticEulerIntegrator";

RegisterSolver({
    type: 'integrator',
    name: 'SymplecticEuler',
    category: 'forces',
    create: () => new SymplecticEulerIntegrator()
});
