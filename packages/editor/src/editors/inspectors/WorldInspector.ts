import { Inspector } from "../../Interfaces";
import { Properties } from "../Properties";
import { worldIcon } from "../../assets/icons/world";
import { SolverDefinition, SolverRegistry } from "@stemngine/engine";
import { SolverManager } from "../../../../engine/src/simulations/core/SolverManager";

export class WorldInspector implements Inspector {

    public readonly id = 'world';
    public readonly name = ' World';
    public icon = worldIcon;

    private overlay: HTMLElement | null = null;

    private parent: Properties;
    private SolverRegistryInstance: SolverRegistry;
    private solverManager: SolverManager;
    private content: HTMLElement;

    constructor(parent: Properties) {

        this.parent = parent;
        this.SolverRegistryInstance = parent.context.simulationManager.SolverRegistryInstance;
        this.solverManager = parent.context.simulationManager.solverManager;
        this.content = this.parent.content;

    }

    public onClick = () => {

        this.render();

    }

    public render() {

        console.log(this.parent);

        const registrySolvers = this.SolverRegistryInstance.getAll();
        const solvers = this.solverManager.getAll();

        console.log({ solvers, registrySolvers });

        this.content.innerHTML = ''

        for (const solver of solvers) {

            const box = document.createElement('div');

            // header
            const header = document.createElement('div');
            header.innerText = solver.name;

            // enable toggle
            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.checked = solver.enabled;

            toggle.onchange = () => solver.enabled = toggle.checked;

            // params
            const body = document.createElement('div');

            for (const key in solver.params) {
                const param = solver.params[key];

                // const input = this.createInput(param);
                // body.appendChild(input);
            }

            box.appendChild(header);
            box.appendChild(toggle);
            box.appendChild(body);

            this.content.appendChild(box);

        }

        const btn = document.createElement('button');
        btn.innerText = '+ Add Solver';

        btn.onclick = () => {

            // simple version first
            this.createAddMenu(registrySolvers);

        };

        this.content.appendChild(btn);

    }

    private createAddMenu(registrySolvers: SolverDefinition[]) {

        const content = this.parent.content;
        const overlay = document.createElement('div');
        overlay.dataset.name = 'the overlay'

        overlay.classList.add('add-tool');

        const input = document.createElement('input');
        input.name = 'add-object';
        input.placeholder = 'Search objects...';

        input.addEventListener('input', () => {

            const query = input.value.toLowerCase();

            const filtered = registrySolvers.filter(o => o.name.toLocaleLowerCase().includes(query));

            this.renderList(listElement, filtered);
        })

        const listElement = document.createElement('div');

        this.renderList(listElement, registrySolvers);

        overlay.appendChild(input);
        overlay.appendChild(listElement);

        this.overlay = overlay;
        // this.container = container;

        content.appendChild(overlay);

        input.focus();

        return { overlay, input, listElement };
    }

    private renderList(listEl: HTMLElement, solverDefinitions: SolverDefinition[]) {

        listEl.innerHTML = '';

        solverDefinitions.forEach(solverDefinition => {

            const row = document.createElement('div');
            row.innerText = solverDefinition.name;
            row.classList.add('menu-row');

            row.onclick = () => {
                this.addSolver(solverDefinition);

                // prevent double-click spam
                // close after spawn succeeds
                requestAnimationFrame(() => {

                    this.closeMenu();
                    this.render();

                });
            }

            listEl.appendChild(row);
        });

    }

    private addSolver(solverDefinition: SolverDefinition) {

        this.solverManager.add(solverDefinition.create());
    }

    private closeMenu() {

        if (this.overlay?.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }

    }

}
