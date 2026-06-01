import { Layers, SolverRegistry, SolverManager, SolverDefinition } from "@stemngine/engine";

import { Context, LAYERS } from "../../Interfaces";

interface Node {
    id: number;
    name: string;
    type: string;
    visible: boolean;
    children: Node[];
    layers: Layers;
}

export const  enum AddSolversEvent {
    OPEN_MODAL = 'add_solvers:open_modal',
    SOLVER_ADDED = 'add_solvers:solver_added'
};

export class AddSolverModal {

    public static name = 'Add Solver';

    private context: Context;
    private layers: Layers; // TODO: may be removed

    private SolverRegistryInstance: SolverRegistry;
    private solverManager: SolverManager;

    constructor(context: Context) {

        this.context = context;
        this.SolverRegistryInstance = context.simulationManager.SolverRegistryInstance;
        this.solverManager = context.simulationManager.solverManager;

        this.layers = new Layers();
        this.layers.set(LAYERS.DEFAULT);

    }

    public render(): HTMLElement {

        const registrySolvers = this.SolverRegistryInstance.getAll();

        const div = document.createElement('div');
        const input = document.createElement('input');
        input.classList.add('input', 'padded');
        input.name = 'add-object';
        input.placeholder = 'Search objects...';

        input.addEventListener('input', () => {

            const query = input.value.toLowerCase();

            const filtered = registrySolvers.filter(s => s.name.toLocaleLowerCase().includes(query));

            this.renderList(listElement, filtered);
        })

        const listElement = document.createElement('div');
        listElement.classList.add('column', 'list');

        this.renderList(listElement, registrySolvers);

        div.appendChild(input);
        div.appendChild(listElement);

        input.focus();

        return div;


    }

    private renderList(listEl: HTMLElement, solverDefinitions: SolverDefinition[]) {

        listEl.innerHTML = '';

        solverDefinitions.forEach(solverDefinition => {

            const row = document.createElement('div');
            row.innerText = solverDefinition.name;
            row.classList.add('list-item', 'fill');

            row.onclick = () => {

                this.addSolver(solverDefinition);

            }

            listEl.appendChild(row);
        });

    }

    private addSolver(solverDefinition: SolverDefinition) {

        this.solverManager.add(solverDefinition.create());

        // prevent double-click spam
        // close after spawn succeeds
        requestAnimationFrame(() => {

            this.context.events.emit({
                type: AddSolversEvent.SOLVER_ADDED,
                target: this,
                source: 'user'
            });

        });

    }

}
