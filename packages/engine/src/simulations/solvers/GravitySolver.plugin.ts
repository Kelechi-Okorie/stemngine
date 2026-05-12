import { RegisterSolver } from "../core/SolverRegistry";
import { GravitySolver } from "./GravitySolver";

RegisterSolver({
    type: 'gravity',
    name: 'Gravity',
    category: 'forces',
    create: () => new GravitySolver()
});
