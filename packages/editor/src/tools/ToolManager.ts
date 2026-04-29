import { ViewportEditor } from "../editors/ViewportEditor";
import { EditorContext, Tool } from "../Interfaces";


export class ToolManager {

    public currentTool!: Tool; // TODO: currentTool should not be null

    constructor() {

    }

    public setTool(tool: Tool) {

        if (this.currentTool) {
            this.currentTool.btn.style.backgroundColor = '#eeeeee';
        }

        tool.btn.style.backgroundColor = 'green';
        this.currentTool = tool;

    }

    public onMouseDown(e: MouseEvent, viewportEditor: ViewportEditor) {

        this.currentTool.onMouseDown?.(e, viewportEditor);

    }

    public onMouseMove(e: MouseEvent, viewportEditor: ViewportEditor) {

        this.currentTool.onMouseMove?.(e, viewportEditor)
    }

    public onClick(e: MouseEvent, viewportEditor: ViewportEditor): void {

        this.currentTool.onClick?.(e, viewportEditor);

    }

}
