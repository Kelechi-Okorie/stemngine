import { Layers, SolverManager } from "@stemngine/engine";

import { Context, LAYERS } from "../../Interfaces";
import { Folder } from "../../pane/nodes/Folder";
import { renderSchema } from "../../pane/controls/factories";
import { Panel } from "../../pane/Panel";
import { ButtonControl } from "../../pane/controls/ButtonControl";
import { ContainerNode } from "../../pane/nodes/ContainerNode";
import { AddSolversEvent } from "./AddSolverModal";

interface Node {
    id: number;
    name: string;
    type: string;
    visible: boolean;
    children: Node[];
    layers: Layers;
}

export class WorldInspectorModal {

    public static name = 'World Inspector';

    private context: Context;
    private layers: Layers; // TODO: may be removed

    private solverManager: SolverManager;

    constructor(context: Context) {

        this.context = context;
        this.solverManager = context.simulationManager.solverManager;

        this.layers = new Layers();
        this.layers.set(LAYERS.DEFAULT);

    }

    public render(): HTMLElement {

        const listEl = document.createElement('div');
        listEl.classList.add('list');

        const solvers = this.solverManager.getAll();

        const panel = new Panel();

        // TODO: add empty text/design for when no solvers exist yet

        for (const solver of solvers) {

            const folder = new Folder(solver.name);
            folder.element.classList.add('mb-sm');

            if (solver.schema) {

                renderSchema(solver.schema, solver, folder);

            }

            panel.add(folder);

        }

        const btnContainer = new ContainerNode();
        btnContainer.element.classList.add('row');
        const action = {
            trigger: () => {
                requestAnimationFrame(() => {   // TODO: should this be here or in the button

                    this.context.events.emit({
                        type: AddSolversEvent.OPEN_MODAL,
                        target: this,
                        source: 'user'
                    });

                });

            }
        }
        const button = new ButtonControl(action, '+ Add Solver');
        btnContainer.add(button);

        panel.add(btnContainer);

        return panel.element;

    }

}
