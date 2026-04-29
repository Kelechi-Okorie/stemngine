import { Tool } from "../Interfaces";
import { EditorContext } from "../Interfaces";
import { cursor3D } from "../assets/icons/3dcursor";
import { ViewportEditor } from "../editors/ViewportEditor";

export class CursorTool implements Tool {

    public readonly name = 'cursor';
    public readonly icon = cursor3D;

    private context: EditorContext;
    public btn!: HTMLElement;

    constructor(context: EditorContext) {

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
