import { Solver } from './Interfaces';
import { Deque } from '../containers/Deque';

// Equivalent to the mathematical notation G = (V, E)
export type DependencyGraph = Map<Solver, Set<Solver>>;

type Hazard = | "WRITE_READ" | "WRITE_WRITE" | "READ_WRITE";

// TODO: add parallelism to scheduler by scheduling all independent solvers in same layer

/**
 * The Dependency-Graph Schedular design
 * 
 * A -> B
 * if B reads something A writes
 * then A must run before B
 */
export class Scheduler {

    /**
     * Solvers only declare:
     * - what data they read
     * - what data they write
     * - solvers DO NOT declare execution order
     * 
     * buildGraph converts the above information into directed causality graph
     * it answers who must runs before who
     * 
     * so it transforms solvers + data usage into execution constraint
     * 
     * @remarks
     * This function builds dependency graph
     * later the following graphs might need to be built:
     * - conflict graph
     * - resource graph
     * - coupling graph
     * - execution graph
     * - etc
     * 
     * TODO: add debug visualization - printGraph(graph)
     * 
     * @param solvers - an array of solvers
     * @returns directed causality graph
     */
    public buildDependencyGraph(solvers: Solver[]): DependencyGraph {

        // stores a full adjacency list representation of a directed graph
        // A -> { B, C, D},
        // B -> {E, F}
        // etc
        /**
         * Stores a full adjacency list representation of a directed graph
         * A -> { B, C, D }
         * B -> { E, F }
         * etc
         */
        let graph: DependencyGraph = new Map();

        /**
         * Create empty graph nodes
         * 
         * creates an empty adjacency list
         */
        for (let A of solvers) {

            graph.set(A, new Set());

        }

        /**
         * Compare every pair
         * 
         * check every solver against every other solver
         * 
         * Yes it's O(n^2) - totally fine because solver count is small (usually <100)
         */
        for (let A of solvers) {

            for (let B of solvers) {

                // skip self
                // solver doesn't depend on it self
                if (A !== B) {

                    // write-write hazard / resource hazard detection
                    if (this.intersects(A.writes, B.writes)) {

                        console.warn('Write-write hazard: ', A.name, B.name);

                    }

                    // if B reads data written by A, then A must run before B
                    if (this.intersects(A.writes, B.reads)) {

                        // so we add edge
                        graph.get(A)?.add(B)
                    }
                }
            }
        }

        return graph;
    }

    /**
     * Computes DependencyGraph execution order using topological sort.
     * 
     * Answers the question:
     * in what order should the solvers be run so that every solver
     * sees the data it needs before it runs
     * 
     * Example:
     * Solver A writes fluid.pressure
     * Solver B reads fluid.pressure
     * Then A must run before B or B will see stale data
     * 
     * compute:
     * inDegree[node] = number of incoming edges
     * 
     * while nodes remain:
     *  pick node with inDegree = 0
     *  schedule it
     *  remove it from the graph
     * 
     * @params solvers - array of solvers
     * @returns array of solvers sorted in dependency-order
     */
    public schedule(solvers: Solver[]): Solver[] {

        const graph = this.buildDependencyGraph(solvers);

        if (this.hasCycle(graph)) {

            console.error("Scheduler: Invalid solver graph:")
            console.log(graph)

            // TODO: degrade gracefully
            throw Error("Scheduler: Solver graph dependency cycle detected");

        }

        let inDegree = new Map<Solver, number>();

        for (let node of graph.keys()) {

            inDegree.set(node, 0);

        }

        for (let [a, set] of graph) {

            for (let b of set) {

                inDegree.set(b, inDegree.get(b)! + 1);

            }
        }

        // let queue: Solver[] = [];
        let queue = new Deque<Solver>();

        /**
         * Push all solvers that have in-degree 0 to queue.
         * they do not depend on anything, so they are safe to run first
         */
        for (let [n, d] of inDegree) {

            if (d === 0) queue.pushBack(n);

        }

        let order: Solver[] = [];

        // we process solvers in the queue until none remain
        while (!queue.isEmpty()) {

            // remove solver from queue
            let n = queue.popFront()!;
            // add it to execution order - scheduling solver n
            order.push(n);

            // loop over all solvers that depend on n
            for (let m of graph.get(n)!) {

                // remove the influence of n
                inDegree.set(m, inDegree.get(m)! - 1);

                // all dependencies of m are now satisfied
                if (inDegree.get(m) == 0) {

                    // add m to queue
                    queue.pushBack(m);

                }
            }
        }

        /**
         * If we scheduled fewer solvers than exists,
         * it means some nodes never reached inDegree 0
         * only happens if there's cycle
         */
        if (order.length !== graph.size) {

            throw "Solver dependency cycle detected";

        }

        return order;
    }

    private intersects(a: Set<string>, b: Set<string>): boolean {

        // optimize by iterating over the smaller set
        if (a.size > b.size) {

            // after this line runs a will always be the smaller set
            [a, b] = [b, a];

        }

        for (const x of a) {

            if (b.has(x)) {

                return true;

            }

        }

        return false;

    }

    // TODO: check how to use this
    public detectHazards(A: Solver, B: Solver): Hazard[] {
        const hazards: Hazard[] = []

        // A->B  B must wait for A
        if (this.intersects(A.writes, B.reads))
            hazards.push("WRITE_READ")

        //A-> A must run first so it reads old data before B overwrites it
        if (this.intersects(A.reads, B.writes))
            hazards.push("READ_WRITE")

        // A<->B order must be enforced (pick one or error)
        if (this.intersects(A.writes, B.writes))
            hazards.push("WRITE_WRITE")


        return hazards
    }

    /**
     * Verify that the order of the graph is actually possible.
     * 
     * @remarks
     * Cycle = A->B->C->A which means A must run before itself
     * that's impossible and the simulation would deadlock
     * 
     * Uses DFS cycle detection.
     * The standard directed-graph cycle detector used in:
     * - compilers
     * - schedulers
     * - build systems
     * - task graphs
     * 
     * @param graph 
     * @returns true if configuration is invalid, false if safe to schedule
     */
    private hasCycle(graph: DependencyGraph): boolean {

        const visited = new Set<Solver>()
        const visiting = new Set<Solver>()

        const dfs = (node: Solver): boolean => {

            // already fully processed
            if (visited.has(node))
                return false

            // back edge detected
            if (visiting.has(node))
                return true

            visiting.add(node)

            for (const neighbor of graph.get(node) ?? []) {
                if (dfs(neighbor))
                    return true
            }

            visiting.delete(node)
            visited.add(node)

            return false
        }

        for (const node of graph.keys()) {
            if (dfs(node))
                return true
        }

        return false
    }
}
