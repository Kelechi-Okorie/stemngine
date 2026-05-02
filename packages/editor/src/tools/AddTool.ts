import { addIcon } from '../assets/icons/addIcon';
import { EditorContext, Tool } from '../Interfaces';

export class AddTool implements Tool {

    public name = 'add';
    public icon = addIcon;
    private context: EditorContext;
    private overlay: HTMLElement | null = null;
    private container: HTMLElement | null = null;
    public btn!: HTMLElement;

    public objects = [
        { name: "Cube", type: "cube" },
        { name: "Sphere", type: "sphere" },
        { name: "Plane", type: "plane" }
    ];

    constructor(context: EditorContext) {

        this.context = context;

    }

    public onClick(e: MouseEvent) {

        // this.createAddMenu(container);

    }

    public onMouseDown(e: MouseEvent) {

        console.log(e);

    }

    public createAddMenu(container: HTMLElement) {

        const overlay = document.createElement('div');

        overlay.style.position = 'absolute';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.width = '300px';
        overlay.style.background = '#1e1e1e';
        overlay.style.borderRadius = '8px';
        overlay.style.padding = '10px';
        overlay.style.zIndex = '200';
        overlay.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';

        const input = document.createElement('input');
        input.name = 'add-object';
        input.placeholder = 'Search objects...';
        input.style.width = '100%';
        input.style.marginBottom = '4px';

        input.addEventListener('input', () => {

            const query = input.value.toLowerCase();

            const filtered = this.objects.filter(o => o.name.toLocaleLowerCase().includes(query));

            this.renderList(list, filtered);
        })

        const list = document.createElement('div');

        this.renderList(list, this.objects);

        overlay.appendChild(input);
        overlay.appendChild(list);

        this.overlay = overlay;
        this.container = container;

        container.appendChild(overlay);

        input.focus();

        return { overlay, input, list };
    }

    public renderList(listEl: HTMLElement, items: { name: string, type: string }[]) {

        listEl.innerHTML = '';

        items.forEach(item => {

            const row = document.createElement('div');
            row.innerText = item.name;
            row.style.padding = '6px';
            row.style.cursor = 'pointer';
            row.style.color = '#ffffff';
            row.style.cursor = 'pointer';
            // row.style.

            row.onclick = () => {
                this.spawnObject(item.type);

                // prevent double-click spam
                // close after spawn succeeds
                requestAnimationFrame(() => this.closeMenu());
            }

            listEl.appendChild(row);
        })

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
