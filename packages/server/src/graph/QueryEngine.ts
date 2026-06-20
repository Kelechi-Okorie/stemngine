import { Pool } from "pg";
import { Concept, Explore, Lesson, Build, Edge, Artifact } from "../Interfaces.js";

/**
 * The real power
 * 
 * You can now answer:
 * - show only intuitive explores
 * - show hardest builds for this concept
 * - show shortest path to Fourier Transform
 * 
 * That is programmable education
 */

/**
 * A Graph Query Engine over artifacts graph.
 * 
 * @remarks
 * A set of deterministic graph traversals + ranking rules
 */
export class QueryEngine {

    private pool: Pool;

    constructor(pool: Pool) {
        
        this.pool = pool;

    }

    /**
     * 
     * @param id 
     * @returns 
     */
    public async getArtifact(id: string): Promise<Artifact | null> {

        const sql = `
            SELECT *
            FROM artifacts
            WHERE id = $1;
        `;

        const res = await this.pool.query(sql, [id]);

        return res.rows[0] ?? null;

    }

    /**
     * 
     * @param id 
     * @param relationType 
     * @param direction 
     */
    public async getRelated(
        id: string,
        relationType: string,
        direction: "outgoing" | "incoming" = "outgoing"
    ): Promise<Edge[]> {

        const sql =
            direction === "outgoing"
                ? `
                SELECT a.* 
                FROM edges e 
                JOIN artifacts a ON a.id = e.to_id 
                WHERE e.from_id = $1 
                AND e.type = $2;`
                : `
                SELECT a.* FROM edges e 
                JOIN artifacts a ON a.id = e.from_id 
                WHERE e.to_id = $1 
                AND e.type = $2;`
            ;

        const res = await this.pool.query(sql, [id, relationType]);

        return res.rows;
    }

    /**
     * Get explores
     * 
     * @param conceptId 
     * @returns 
     */
    public async getExplores(conceptId: string) {

        return this.getRelated(conceptId, "explore_of", "incoming");
    }

    /**
     * Get lessons
     * 
     * @param conceptId 
     * @returns 
     */
    public async getLessons(conceptId: string) {

        return this.getRelated(conceptId, "lesson_of", "incoming");

    }

    /**
     * Get builds
     * @param conceptId 
     * @returns 
     */
    public async getBuilds(conceptId: string) {

        return this.getRelated(conceptId, "build_of", "incoming");

    }

    /**
     * Get dependencies (prerequisites)
     * 
     * @param conceptId 
     * @returns 
     */
    public async getDependencies(conceptId: string) {

        return this.getRelated(conceptId, "depends_on", "outgoing");

    }

    /**
     * What this unlocks
     * 
     * @param conceptId 
     * @returns 
     */
    public async getDependents(conceptId: string) {

        return this.getRelated(conceptId, "depends_on", "incoming");

    }

    // ============================================
    // Learning intelligence
    // user_progress(user_id, concept_id)
    // ============================================

    /**
     * 
     * @param userId 
     * @returns 
     */
    public async getNextConcepts(userId: string) {

        const sql = `
        SELECT c.*
        FROM artifacts c
        WHERE c.type = 'concept'
        AND NOT EXISTS ( 
            SELECT 1 
            FROM edges e 
            WHERE e.from_id = c.id 
            AND e.type = 'depends_on'
            AND e.to_id NOT IN ( 
                SELECT concept_id 
                FROM user_progress 
                WHERE user_id = $1 
            ) 
        );`;

        const res = await this.pool.query(
            sql,
            [userId]
        );

        return res.rows;
    }

    public async getLearningPath(targetConceptId: string) {

        const sql = `
            WITH RECURSIVE deps AS (
            SELECT to_id
            FROM edges
            WHERE from_id = $1 AND type = 'depends_on'


            UNION

            SELECT e.to_id
            FROM edges e
            JOIN deps d ON e.from_id = d.to_id
            WHERE e.type = 'depends_on'
            )
            SELECT a.*
            FROM artifacts a
            WHERE a.id IN (SELECT to_id FROM deps);
            `
            ;

        const res = await this.pool.query(sql, [targetConceptId]);

        return res.rows;

    }

    /**
     * 
     * @param conceptId 
     */
    public getUnlockedConcepts(conceptId: string) {

        // TODO: implement or remove
        throw new Error('not implemented');

        // const edges = this.edges.incoming.get(conceptId) || [];

        // return edges
        //     .filter(e =>
        //         e.scope === "concept" &&
        //         e.type === "depends_on"
        //     )
        //     .map(e => this.registry.get(e.from));
    }

    /**
     * 
     * @param conceptId 
     */
    public getBestExplore(conceptId: string) {

        // TODO: implement or remove
        throw new Error('not implemented');

        // const explores = this.getExplores(conceptId);

        // return explores.sort((a, b) => {

        //     const wa = a.metadata?.weight ?? 0;
        //     const wb = b.metadata?.weight ?? 0;

        //     return wb - wa;
        // })[0];

    }

    /**
     * 
     * @param userState 
     * @param conceptId 
     */
    public getNextForUser(userState: Record<string, any>, conceptId: string) {

        // TODO: implement or remove
        throw new Error('not implemented');

        /**
         * You can filter by
         * - completed concepts
         * - difficulty
         * - performance
         */
    }

}

// Example usage

// const explores = await queryEngine.getExplores(
//   "physics.mechanics.velocity"
// );

// const next = await queryEngine.getNextConcepts(userId);

// const deps = await queryEngine.getDependencies(
//   "physics.mechanics.projectile_motion"
// );
