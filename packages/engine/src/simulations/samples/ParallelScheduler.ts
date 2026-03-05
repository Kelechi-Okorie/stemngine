
// scheduleParallel(solvers: Solver[]): Solver[][] {

//     const graph = this.buildDependencyGraph(solvers);

//     if (this.hasCycle(graph))
//         throw Error("Cycle detected");

//     const inDegree = new Map<Solver, number>();

//     for (let node of graph.keys())
//         inDegree.set(node, 0);

//     for (let [a, set] of graph)
//         for (let b of set)
//             inDegree.set(b, inDegree.get(b)! + 1);

//     // first batch
//     let ready: Solver[] = [];

//     for (let [n,d] of inDegree)
//         if (d === 0)
//             ready.push(n);

//     const batches: Solver[][] = [];

//     while (ready.length) {

//         // current parallel batch
//         const batch = ready;
//         batches.push(batch);

//         // next batch
//         const next: Solver[] = [];

//         for (let n of batch) {

//             for (let m of graph.get(n)!) {

//                 const deg = inDegree.get(m)! - 1;
//                 inDegree.set(m, deg);

//                 if (deg === 0)
//                     next.push(m);
//             }
//         }

//         ready = next;
//     }

//     if (batches.flat().length !== graph.size)
//         throw Error("Cycle detected");

//     return batches;
// }

// // main loop
// for (let batch of batches) {

//     await Promise.all(
//         batch.map(s => s.step(dt, world))
//     );

// }