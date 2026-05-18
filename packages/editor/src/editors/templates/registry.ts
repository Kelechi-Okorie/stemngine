import { Context, TemplateNode, Region } from "../../Interfaces";
import { ViewportEditor } from "../ViewportEditor";
import { Player } from "../Player";
import { Outliner } from "../Outliner";
import { Properties } from "../Properties";
import { defaultTemplate } from "./default";
import { generateUUID } from "../../../../engine/src/math/MathUtils";

export const editorRegistry = {
    viewport: (ctx: Context) => new ViewportEditor(ctx),
    player: (ctx: Context) => new Player(ctx),
    outliner: (ctx: Context) => new Outliner(ctx),
    properties: (ctx: Context) => new Properties(ctx)
};

export function createEditorInstance<T extends keyof typeof editorRegistry>(type: T, context: Context) {

    const factory = editorRegistry[type];

    if (!factory) {

        throw new Error(type);

    }

    return factory(context);

}

export function buildRegion(node: TemplateNode, context: Context): Region {

    if (node.type === 'leaf') {

        return {
            ...node,
            id: generateUUID(),
            editor: createEditorInstance(node.editorType, context)
        };
    }

    return {
        ...node,
        id: generateUUID(),
        a: buildRegion(node.a, context),
        b: buildRegion(node.b, context)
    };

}

export const templates = {
    default: defaultTemplate,
    minimal: {
        type: 'leaf',
        name: 'viewport',
        editorType: 'viewport'
    },
    simulationOnly: {
        type: 'leaf',
        name: 'player',
        editorType: 'player'
    }
};

// export function crateNewProject(templateName: TemplateNode, context: Context) {

//     const template = templates[templateName];
//     const region = buildRegion(template, context);

//     setAppState({
//         type: 'editor',
//         project: {
//             layout: region
//         }
//     });
// }

// 3. Save layouts cleanly
// When saving:
// project.layout // serialize without editor instances
// When loading:
// buildRegion(savedLayout, context)
