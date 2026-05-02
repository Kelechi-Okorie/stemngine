import { BoxGeometry, MeshBasicMaterial, Mesh, World, Simulation, ParticleSystem, SimBindingManager, GlobalEventDispatcher, SystemType } from "@stemngine/engine";

import { EditorContext } from "../Interfaces";
import { ViewportEditorEventType } from "../editors/ViewportEditor";

export class SimulationManager {

    // TODO: may need to add id and other things
    public name = 'simulation manager';

    public world: World
    public simulation: Simulation;
    public bindingManager: SimBindingManager;

    // TODO: may have to take in a bigger context
    constructor(bindingManager: SimBindingManager) {

        this.world = new World();
        this.simulation = new Simulation(this.world);
        this.bindingManager = bindingManager;

    }

    public addEntity(type: string, context: EditorContext, ) {

        const world = this.world;

        switch (type) {

            case 'cube': {

                // const ps = world.getSystem(SystemType.ParticleSystem);
                const ps = new ParticleSystem();
                const particle = ps.createParticle({});

                // 👇 create visual
                const mesh = new Mesh(
                    new BoxGeometry(1, 1, 1),
                    new MeshBasicMaterial({ color: 0x00ff00 })
                );

                mesh.position.copy(context.state.cursor.position);

                this.bindingManager.createBinding(mesh, 'position', ps.particles[0].position);

                world.addSystem(0, ps);

                context.state.scene.add(mesh);

                GlobalEventDispatcher.instance.dispatchEvent({
                    type: ViewportEditorEventType.ENTITY_CREATED,
                    entity: particle,
                    visual: mesh,   // TODO: may be removed
                    position: mesh.position.clone,  // TODO: may be removed
                    source: 'user'
                });

                // 👇 store mapping
                // mesh.userData['entity'] = particle;

                // return particle;

                break;

            }

            default:
                throw new Error('Unknown entity type ' + type);
        }

    }

    public step(dt: number) {

        this.simulation.step(dt);

    }

}
