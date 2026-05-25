import { Context, Tool } from "../Interfaces";

export type Config = {
    context: Context;
    tools: Tool[];
    direction: 'row' | 'column';
    position: 'right' | 'left' | 'top' | 'bottom';
}

export class Toolbar {

    private context: Context;
    private tools: Tool[];
    private direction: 'row' | 'column';
    private position

    constructor(config: Config) {

        const { context, tools, direction, position } = config;

        this.context = context;
        this.tools = tools;
        this.direction = direction;
        this.position = `toolbar-${position}`;

    }

    public mount(container: HTMLElement) {


        const div = document.createElement('div');
        div.classList.add('toolbar', this.direction, this.position);

        this.tools.forEach(tool => {
            tool.mount(div);
        });

        container.appendChild(div);

    }

}
