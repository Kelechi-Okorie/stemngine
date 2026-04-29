import { ToolManager } from "./ToolManager";
import { SelectTool } from "./SelectTool";
import { AddTool } from "./AddTool";
import { CursorTool } from "./CursorTool";
import { EditorContext, Tool } from "../Interfaces";
import { BrowserInputManager } from "../inputs/BrowserInputManager";
import { State } from "../core/State";
import { getMouseNDC } from "../viewport/renderer/interaction";

export class Toolbar {

    // private toolManager: ToolManager;
    private context: EditorContext;

    constructor(context: EditorContext/* toolManager: ToolManager */) { 

        // this.toolManager = toolManager;
        this.context = context

    }

    public create(container: HTMLElement) {

        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.position = 'absolute';
        div.style.top = '20px';
        div.style.left = '20px';
        div.style.zIndex = '100';

        const toolManager = this.context.toolManager;

        const selectTool = new SelectTool();
        const selectBtn = this.createButton(selectTool, () => {

            toolManager.setTool(selectTool);

        });

        // TODO: find a better way to set select tool as default
        toolManager.setTool(selectTool);

        const addTool = new AddTool(this.context);
        const addBtn = this.createButton(addTool, () => {

            // this.toolManager.setTool(addTool);

            // console.log('clicked add tool', addTool)
            addTool.createAddMenu(container);
        });

        const cursorTool = new CursorTool(this.context);
        const cursorBtn = this.createButton(cursorTool, (/* e: MouseEvent */) => {

            // const mouse = getMouseND)
            toolManager.setTool(cursorTool);
        });

        div.appendChild(selectBtn);
        div.appendChild(cursorBtn);
        div.append(addBtn);

        container.appendChild(div);

    }

    public createButton(tool: Tool, onClick: () => void): HTMLElement {

        const btn = document.createElement('button');
        btn.style.width = '32px';
        btn.style.height = '32px';
        btn.style.background = '#eeeeee';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.marginBottom = '2px';

        btn.innerHTML = tool.icon;
        tool.btn = btn;

        btn.onmousedown = () => {

            btn.style.background = '#cccccc';
        };

        // btn.onmouseleave = () => {

        //     btn.style.background = '#2c2c2c';

        // }

        // btn.onmousedown = () => {

        //     btn.style.background = '#1f1f1f';

        // }

        btn.onmouseup = () => {

            btn.style.background = '#eeeeee';

        }

        // btn.addEventListener('click', () => {

        //     console.log('the objbtn is clicked');

        // }, false);

        btn.onclick = onClick;

        return btn;

    }
}
