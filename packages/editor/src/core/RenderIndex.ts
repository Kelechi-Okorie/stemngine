import { Node3D } from "@stemngine/engine";

export class RenderIndex {

    // <representation.id, Node3D>
    private representationToNode3D = new Map<string, Node3D>();   // TODO: type better

    // <Node3D, representation.id>
    private Node3DToRepresentation = new WeakMap<Node3D, string>();

    public set(repId: string, Node3D: Node3D) {

        this.representationToNode3D.set(repId, Node3D);
        this.Node3DToRepresentation.set(Node3D, repId);

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

        return this.Node3DToRepresentation.get(Node3D);

    }

}
