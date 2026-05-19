import { Context, TemplateNode, Region } from "../../Interfaces";
import { ViewportEditor } from "../ViewportEditor";
import { Player } from "../Player";
import { Outliner } from "../Outliner";
import { Properties } from "../Properties";
import { defaultTemplate } from "./default";
import { generateUUID } from "../../../../engine/src/math/MathUtils";

// Optional upgrade (important for your engine)
// If your system becomes dynamic (like IDE layouts), consider adding:
// A. Stable node IDs in template
// So you can diff properly:
// type TemplateNode = {
//     id?: string;
//     ...
// }

// Then you can:
// detect moved editors
// preserve editor state per node
// avoid full rebuild
// B. Diff-based persistence (advanced but powerful)

// Instead of full conversion:
// compute changes:
// added nodes
// removed nodes
// resized ratios
// store patch instead of full tree

// This is how:
// VSCode layout
// Unity editor layouts
// Unreal UI layouts
// all work internally.

// If you want next step, I can help you design:
// a layout diff system (so resizing doesn’t rebuild everything)
// or a drag-and-drop split/merge system for regions
// or even a persistent editor graph like Unity/Blender docking system

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
            editor: createEditorInstance(node.editorType, context),
            editorType: node.editorType
        };
    }

    return {
        ...node,
        id: generateUUID(),
        a: buildRegion(node.a, context),
        b: buildRegion(node.b, context)
    };

}

export function regionToTemplate(region: Region): TemplateNode {

    if (region.type === 'leaf') {

        return {
            type: 'leaf',
            name: region.name,
            editorType: region.editorType
        };

    }

    return {
        type: 'split',
        direction: region.direction,
        ratio: region.ratio,
        a: regionToTemplate(region.a),
        b: regionToTemplate(region.b)
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

// 3. Save layouts cleanly
// When saving:
// project.layout // serialize without editor instances
// When loading:
// buildRegion(savedLayout, context)
