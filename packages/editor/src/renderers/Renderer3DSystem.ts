import { GlobalEventDispatcher, MeshBasicMaterial, Scene, SimBindingManager, SphereGeometry, Mesh, BoxGeometry } from "@stemngine/engine";
import { RepresentationEvent, RepresentationStoreEventType } from "../core/RepresentationStore";
import { EditorContext, VisualRepresentation } from "../Interfaces";

export class Renderer3DSystem {

    private scene: Scene;
    private bindingManager: SimBindingManager;

    private visuals = new Map<string, any>();   // TODO: type better

    constructor(context: EditorContext, bindingManager: SimBindingManager) {

        const { state } = context;

        this.scene = state.scene;
        this.bindingManager = bindingManager;

        GlobalEventDispatcher.instance.addEventListener(
            RepresentationStoreEventType.REPRESENTATION_SET,
            this.onRepAdded.bind(this)
        );

        GlobalEventDispatcher.instance.addEventListener(
            RepresentationStoreEventType.REPRESENTATION_REMOVE,
            this.onRepRemoved.bind(this)
        );

    }

    private onRepAdded(e: RepresentationEvent) {    // TODO: type better

        const { type, representation } = e;
        const { entity } = representation;

        if (!entity) {

            //  TODO: is this necessary
            throw new Error('no entity found');
        }

        const mesh = this.createMesh(representation);

        // TODO: confirm binding is atomic. should not bind a composite,
        // i.e, vec3 or vec2. only simple values like number, boolean, string, etc, should be bound
        this.bindingManager.createBinding(
            mesh,
            'position',
            (entity as any).position    /// TODO: find a better way
        );

        this.scene.add(mesh);

        this.visuals.set(representation.id, mesh);

    }

    private onRepRemoved(e: any) {  // TODO: type better

        const mesh = this.visuals.get(e.representationId);
        if (!mesh) return;

        this.scene.remove(mesh);
        this.visuals.delete(e.representationId);

    }

    private createMesh(rep: VisualRepresentation) {

        const { entity } = rep;

        let mesh: any;  // TODO: type better

        switch (rep.kind) {

            case 'point':
                mesh = new Mesh(
                    new SphereGeometry(rep.size ?? 0),
                    new MeshBasicMaterial({ color: rep.color ?? 0xffff00 })
                );

                break;

            default:
                mesh = new Mesh(
                    new BoxGeometry(1, 1, 1),
                    new MeshBasicMaterial({ color: 0xff0000 })
                );

        }

        mesh.position.copy(entity.position);

        return mesh;

    }

}
