import { Tool } from "../Interfaces";
import { Context } from "../Interfaces";
import { cursor3DIcon } from "../assets/icons/3dcursor";
import { ViewportEditor } from "../editors/ViewportEditor";

export class CursorTool implements Tool {

    public readonly name = 'cursor';
    public readonly icon = cursor3DIcon;

    private context: Context;
    public btn!: HTMLElement;

    public allows: Record<string, boolean> = {};

    constructor(context: Context) {

        this.context = context;

    }

    public onClick(e: MouseEvent, viewportEditor: ViewportEditor): void {

    }

    public onMouseDown(e: MouseEvent, viewportEditor: ViewportEditor): void {

        const point = viewportEditor.getIntersectionPoint(e);

        if (!point) return;

        this.context.state.cursor.position.copy(point);
        
    }

    public update(event: MouseEvent): void {


    }
}
