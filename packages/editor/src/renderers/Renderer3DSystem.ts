import { GlobalEventDispatcher, MeshBasicMaterial, Scene, SimBindingManager, SphereGeometry, Mesh, BoxGeometry, MeshStandardMaterial, disposeMaterial } from "@stemngine/engine";
import { RepresentationEvent, RepresentationStoreEventType } from "../core/RepresentationStore";
import { Context, VisualRepresentation } from "../Interfaces";
import { RenderIndex } from "../core/RenderIndex";

export class Renderer3DSystem {

    private scene: Scene;
    private bindingManager: SimBindingManager;
    private RenderIndex: RenderIndex;

    constructor(context: Context, bindingManager: SimBindingManager) {

        const { state } = context;

        this.scene = state.scene;
        this.bindingManager = bindingManager;

        this.RenderIndex = context.renderIndex;

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

        this.RenderIndex.set(representation.id, mesh);

        this.scene.add(mesh);

    }

    private onRepRemoved(e: any) {  // TODO: type better

        const repId = e.representationId;
        const mesh = this.RenderIndex.getNode3D(repId);
        if (!mesh) return;

        this.scene.remove(mesh);

        this.RenderIndex.delete(repId)
        // TODO: check if true No need to delete from weakmap

    }

    private createMesh(rep: VisualRepresentation) {

        const { entity } = rep;

        let mesh: any;  // TODO: type better

        switch (rep.kind) {

            case 'point':
                mesh = new Mesh(
                    new SphereGeometry(rep.size ?? 0),
                    // new MeshBasicMaterial({ color: rep.color ?? 0xffff00 })
                    // new MeshStandardMaterial({
                    //     color: rep.color ?? 0xffff00,
                    //     roughness: 0.5,
                    //     metalness: 0.1
                    // })
                    new MeshStandardMaterial({
                        color: rep.color ?? 0xff0000,
                        roughness: 0.8,   // ↑ increase this
                        metalness: 0.0    // keep this at 0 for now
                    })
                );

                break;

            default:
                mesh = new Mesh(
                    new BoxGeometry(1, 1, 1),
                    new MeshBasicMaterial({ color: 0xff0000 })
                );

        }

        mesh.position.copy((entity as unknown as Mesh).position);   // TODO: find a better way

        return mesh;

    }

    public reset(): void {

        // remove all render objects from the scene
        for (const repId of this.RenderIndex.getAll?.() ?? []) {

            const mesh = this.RenderIndex.getNode3D(repId);
            if (mesh) {

                this.scene.remove(mesh);

                // / optional but good practice if supported
                if ('geometry' in mesh) {

                    (mesh as Mesh).geometry.dispose();
                }

                if ('material' in mesh) {

                    disposeMaterial((mesh as Mesh).material)
                }

            }
        }

        this.scene.dispose();

        this.RenderIndex.reset();

        this.bindingManager.clear();
    }

}
