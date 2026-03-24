import { Transform } from "../Interfaces";

/**
 * If you split trnsforms cleanly,  you can later invert them:
 * screen -> normalized -> data
 * 
 * which means:
 * - mouse hover
 * - zoom
 * - pan
 * - picking
 */

// Data -> Axes -> Normalized -> Viewport -> Screen

export class TransformPipeline implements Transform {

    private transforms: Transform[] = [];

    constructor(transforms: Transform[]) {

        this.transforms = transforms;

    }

    public map(x: number, y: number) {

        let px = x
        let py = y

        for (const t of this.transforms) {
            const p = t.map(px, py)
            px = p.x
            py = p.y
        }

        return { x: px, y: py }

    }

}
