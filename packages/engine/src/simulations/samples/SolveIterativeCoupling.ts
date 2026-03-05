function solveIterativeCoupling(loopSolvers: Solver[], dt: number, maxIterations: number, tolerance: number) {
    let converged = false;
    let iteration = 0;

    // store previous state for convergence check
    let prevStates = loopSolvers.map(s => s.snapshot());

    while (!converged && iteration < maxIterations) {
        for (const solver of loopSolvers) {
            solver.solve(dt);
        }

        converged = true;

        // check if all solvers converged
        for (let i = 0; i < loopSolvers.length; i++) {
            if (!loopSolvers[i].hasConverged(prevStates[i], tolerance)) {
                converged = false;
                prevStates[i] = loopSolvers[i].snapshot(); // update snapshot
            }
        }

        iteration++;
    }

    if (!converged) {
        console.warn(`Iterative coupling did not converge in ${maxIterations} iterations`);
    }
}