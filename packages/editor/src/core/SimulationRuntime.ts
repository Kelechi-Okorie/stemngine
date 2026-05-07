import { Clock, SimBindingManager } from "@stemngine/engine";
import { SimulationManager } from "./SimulationManager";

import { Editor } from "../Interfaces";

enum EventTypes {
    PLAY = 'PLAY'
}

type Listener = () => void;

export { EventTypes as ToolManagerEventTypes };
export type ToolManagerEventListener = Listener;

type UpdateFunction = (dt: number) => void;

type Channel =
    | 'preSimulation'
    | 'simulation'
    | 'postSimulation'
    | 'update'
    | 'render';

export type SimulationRuntimeChannel = Channel;

// Each channel should have a clear contract:

// Channel	Purpose
// preSimulation	modify inputs before physics
// simulation	physics step (usually internal)
// postSimulation	read results, debugging
// update	editor/UI logic
// render	drawing

export class SimulationRuntime {

    private clock: Clock;
    public isPlaying = false;

    private simulationManager: SimulationManager;
    private bindingManager: SimBindingManager;

    // TODO: micro-optimization this might be cheaper, but not necessary now
    // private channels: Record<Channel, UpdateFunction[]> = {
    //     preSimulation: [],
    //     simulation: [],
    //     postSimulation: [],
    //     update: [],
    //     render: []
    // };
    private channels = new Map<Channel, UpdateFunction[]>();
    private functionToMeta = new WeakMap<UpdateFunction, { channel: Channel, index: number }>();

    private animationId!: number;

    constructor(
        simulationManager: SimulationManager,
        bindingManager: SimBindingManager
    ) {

        this.simulationManager = simulationManager;
        this.bindingManager = bindingManager;

        this.channels.set('preSimulation', []);
        this.channels.set('simulation', []);
        this.channels.set('postSimulation', []);
        this.channels.set('update', []);
        this.channels.set('render', []);

        this.clock = new Clock();

    }

    public run() {

        this.animationId = requestAnimationFrame(this.loop);

    }

    public play(): void {

        if (this.isPlaying) return;

        this.isPlaying = true;

    }

    public pause(): void {

        if (!this.isPlaying) return;

        this.isPlaying = false;

    }

    public reset(): void {

        // TODO:

    }

    public schedule(channel: Channel, fn: UpdateFunction): void {

        const list = this.channels.get(channel);
        if (!list) {

            throw new Error(`Channel ${channel} does not exist`);

        }

        // this.functionToIndex.set(fn, list.length);
        this.functionToMeta.set(fn, { channel, index: list.length });
        list.push(fn);

    }

    public unSchedule(fn: UpdateFunction) {

        const meta = this.functionToMeta.get(fn);
        if (!meta) {

            throw new Error('Function not scheduled');

        }

        const list = this.channels.get(meta.channel)!;
        const lastIndex = list.length - 1;
        const lastFn = list[lastIndex];

        list[meta.index] = lastFn;
        list.pop();

        this.functionToMeta.delete(fn);

        if (lastFn !== fn) {

            this.functionToMeta.set(lastFn, {
                channel: meta.channel,
                index: meta.index
            });

        }

    }

    private runChannel(channel: Channel, dt: number) {

        const list = this.channels.get(channel)!;

        for (let i = 0, l = list.length; i < l; i++) {

            list[i](dt);

        }
    }

    // TODO: check with the engines animation loop
    private loop = () => {

        this.clock.tick();
        const dt = this.clock.dt;

        this.runChannel('preSimulation', dt);

        // simulation phase
        if (this.isPlaying) {

            this.simulationManager.step(dt);

        }

        this.runChannel('postSimulation', dt);

        this.bindingManager.update();

        this.runChannel('update', dt);

        this.runChannel('render', dt);

        this.animationId = requestAnimationFrame(this.loop);
    }

    public stepOnce = () => {

        const dt = 1 / 60; // fixed step
        this.simulationManager.step(dt);
        this.bindingManager.update();

    }

}
