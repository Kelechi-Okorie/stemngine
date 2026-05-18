import { GlobalEventDispatcher, Node3D } from "@stemngine/engine";

export class RenderIndex {

    // <representation.id, Node3D>
    private representationToNode3D = new Map<string, Node3D>();   // TODO: type better

    // <Node3D, representation.id>
    private node3DToRepresentation = new WeakMap<Node3D, string>();

    public set(repId: string, Node3D: Node3D) {

        this.representationToNode3D.set(repId, Node3D);
        this.node3DToRepresentation.set(Node3D, repId);

    }

    public delete(repId: string) {

        const Node3D = this.representationToNode3D.get(repId);
        if (!Node3D) return;

        this.representationToNode3D.delete(repId);
        // WeakMap auto-clean

    }

    public getNode3D(repId: string) {

        return this.representationToNode3D.get(repId);

    }

    public getRepId(Node3D: Node3D) {

        return this.node3DToRepresentation.get(Node3D);

    }

    public getAll(): string[] {

        return Array.from(this.representationToNode3D.keys());

    }

    public reset = () => {

        // Important detail:

        // WeakMap does NOT need manual clearing
        // Map MUST be cleared
        // break logical mapping
        this.representationToNode3D.clear();

        // optional safety: force GC friendliness
        // (only needed if Node3D holds heavy GPU/scene data)

        //         If later you control Node3D lifecycle:

        // for (const node of this.Node3DToRepresentation.keys()) {
        //     node.dispose?.();
        // }

        // One subtle improvement (important for engines)
        // Right now you only clear one direction:
        // repId → Node3D (Map)
        // Node3D → repId (WeakMap)
        // That is fine, BUT only safe if:
        // Node3D lifecycle is fully managed elsewhere
        // If not, you may get dangling visuals.

    }

}
