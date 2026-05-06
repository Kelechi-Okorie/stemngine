import { BoxGeometry, GlobalEventDispatcher, Mesh, MeshBasicMaterial, Scene, SimBindingManager, SphereGeometry } from "@stemngine/engine";

import { EntityEventType } from "./SimulationManager";

export class PresentationManager {

    private scene: Scene;
    private bindingManager: SimBindingManager;

    private visuals = new Map<string, Mesh>;

    constructor(scene: Scene, bindingManager: SimBindingManager) {

        this.scene = scene;
        this.bindingManager = bindingManager;

        GlobalEventDispatcher.instance.addEventListener(
            EntityEventType.ENTITY_CREATED,
            this.onEntityCreated.bind(this)
        );

        GlobalEventDispatcher.instance.addEventListener(
            EntityEventType.ENTITY_CHANGED,
            this.onRepresentationChanged.bind(this)
        );

    }

    public onEntityCreated(e: any) {

        const { type, entity } = e;

        console.log(e, 'logging the received event on enttity created');

        let geometry: any;
        let material: any;
        let mesh: Mesh;

        switch (entity.type) {

            case 'particle':
                geometry = new BoxGeometry(1, 1, 1);
                material = new MeshBasicMaterial({ color: 0xff0000 });
                break;
            default:
                geometry = new BoxGeometry(1, 1, 1);
                material = new MeshBasicMaterial({ color: 0xff0000 });
                break;

        }

        mesh = new Mesh(geometry, material);

        this.bindingManager.createBinding(
            mesh,
            'position',
            entity.position
        );

        this.scene.add(mesh);
        this.visuals.set(entity.id, mesh);

    }

    public onRepresentationChanged(e: any) {

        const { entity, representation } = e;

        // remove onl visual is existes
        const existing = this.visuals.get(entity.id);
        if (existing) {

            this.scene.remove(existing);

        }

        // create new one
        let mesh: Mesh;
        let geometry: any;  // TODO: type better

        switch (representation.shape) {
            case 'cube':
                geometry = new BoxGeometry(1, 1, 1);
                break;

            case 'sphere':
                geometry = new SphereGeometry(0.5);
                break;

            default:
                geometry = new BoxGeometry(1, 1, 1);
        }

        const material = new MeshBasicMaterial({ color: representation.color });

        mesh = new Mesh(geometry, material);

        this.bindingManager.createBinding(
            mesh,
            'position',
            entity.position
        );

        this.scene.add(mesh);
        this.visuals.set(entity.id, mesh);

    }

}
