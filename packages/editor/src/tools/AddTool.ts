import { addIcon } from '../assets/icons/addIcon';
import { EditorContext, Tool } from '../Interfaces';
import addToolStyle from '../assets/css/addToolStyle';

const OBJECTS = [
    // physics - state carriers
    {name: "Particle", type: "particle"},
    {name: "Rigid Body", type: "rigid_body"},

    // physics - constraints / relations
    {name: "Distance", type: "distance"},
    {name: "Fixed Point", type: "fixed_point"},
    {name: "Joint (hinge, slider)", type: "joint"},

    // physics - forces
    {name: "Gravity", type: "gravity"},
    {name: "Spring", type: "spring"},
    {name: "External", type: "external"},

    // math - objects
    {name: "Point", type: "point"},
    {name: "Scalar", type: "scalar"},
    {name: "Vector", type: "vector"},

    // math - mappings
    {name: "Function f(x)", type: "function"},
    {name: "Parametric curve", type: "parametric_curve"},

    // math relations
    {name: "Equation", type: "equation"},
    {name: "Constraint", type: "con"}
];

export class AddTool implements Tool {

    public name = 'add';
    public icon = addIcon;
    private context: EditorContext;
    private overlay: HTMLElement | null = null;
    private container: HTMLElement | null = null;   // TODO: container should be the thing that holds the canvas
    public btn!: HTMLElement;

    constructor(context: EditorContext) {

        this.context = context;

        context.styleManager.registerStyle('add-tool', addToolStyle)

    }

    public onClick(e: MouseEvent) {

        // this.createAddMenu(container);

    }

    public onMouseDown(e: MouseEvent) {

        console.log(e);

    }

    public createAddMenu(container: HTMLElement) {

        const overlay = document.createElement('div');
        overlay.dataset.name = 'the overlay'

        overlay.classList.add('add-tool');

        const input = document.createElement('input');
        input.name = 'add-object';
        input.placeholder = 'Search objects...';

        input.addEventListener('input', () => {

            const query = input.value.toLowerCase();

            const filtered = OBJECTS.filter(o => o.name.toLocaleLowerCase().includes(query));

            this.renderList(listElement, filtered);
        })

        const listElement = document.createElement('div');

        this.renderList(listElement, OBJECTS);

        overlay.appendChild(input);
        overlay.appendChild(listElement);

        this.overlay = overlay;
        this.container = container;

        container.appendChild(overlay);

        input.focus();

        return { overlay, input, listElement };
    }

    public renderList(listEl: HTMLElement, items: { name: string, type: string }[]) {

        listEl.innerHTML = '';

        items.forEach(item => {

            const row = document.createElement('div');
            row.innerText = item.name;
            row.classList.add('menu-row');

            row.onclick = () => {
                // this.spawnObject(item.type);

                // prevent double-click spam
                // close after spawn succeeds
                requestAnimationFrame(() => this.closeMenu());
            }

            listEl.appendChild(row);
        });

    }

    public spawnObject(type: string) {

        this.context.simulationManager.addEntity(type, this.context);

    }

    public closeMenu() {

        if (this.overlay?.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }

    }

}
