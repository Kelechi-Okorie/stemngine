import { ViewportEditor } from "../editors/ViewportEditor";
import { Context, Tool } from "../Interfaces";

enum EventTypes {
    TOOL_SET = 'TOOL:SET'
}

type Listener = (tool: Tool) => void;

export { EventTypes as ToolManagerEventTypes};
export type ToolManagerEventListener = Listener;

export class ToolManager {

    public currentTool: Tool | null = null; // TODO: currentTool should not be null

    private listeners = new Map<EventTypes, Listener[]>();

    constructor() {

    }

    public setTool(tool: Tool) {

        if (this.currentTool) {
            this.currentTool.btn.style.backgroundColor = '#eeeeee';
        }

        tool.btn.style.backgroundColor = 'green';
        this.currentTool = tool;

        this.emit(EventTypes.TOOL_SET, tool);

    }

    public onMouseDown(e: MouseEvent, viewportEditor: ViewportEditor) {

        this.currentTool?.onMouseDown?.(e, viewportEditor);

    }

    public onMouseMove(e: MouseEvent, viewportEditor: ViewportEditor) {

        this.currentTool?.onMouseMove?.(e, viewportEditor)
    }

    public onClick(e: MouseEvent, viewportEditor: ViewportEditor): void {
        console.log('clicked')

        this.currentTool?.onClick?.(e, viewportEditor);

    }

    public on(type: EventTypes, fn: Listener): void {

        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }

        this.listeners.get(type)!.push(fn);

    }

    public emit(type: EventTypes, tool: Tool): void {

        const list = this.listeners.get(type);

        if (!list) return;

        for (const fn of list) fn(tool);

    }

    public remove(type: EventTypes, fn: Listener): void {

        const list = this.listeners.get(type);

        if (!list) return;

        // TODO: check if this is costly
        const index = list.indexOf(fn);

        if (index !== -1) {
            list.splice(index, 1);
        }

    }

    public reset(): void {

        if (this.currentTool) {

            this.currentTool.btn.style.backgroundColor = '#eeeeee'; // TODO:

        }

        this.currentTool = null;

        // TODO: revisit later
        // this.emit(EventTypes.TOOL_SET, null as any);
    }

}
