
import { Series } from "../core/Series";
import { Plotter, RenderContext } from '../Interfaces';

// TODO:
// stacked bars
// grouped bars
// variable widths (bars represent not just points but intervals)

type DataPoint = {
    x: number;
    y: number;
    width?: number;
};

export class BarPlotter implements Plotter {

    // TODO: these should be passed in as part of the renderContext
    // and also have default
    private fillStyle: string = 'steelblue';
    private gapRatio: number = 0.8; // 80% filled, 20% gap
    private minWidthPx = 1;

    public draw(renderContext: RenderContext, series: Series) {

        const { renderer: ctx, transform } = renderContext;
        const data = series.getData();

        if (data.length === 0) return;

        ctx.save();

        // TODO: the fillSty;e could be passed in as part of renderContext
        ctx.fillStyle = this.fillStyle;

        for (let i = 0; i < data.length; i++) {

            const p = data[i];

            // 1. resolve width (hybrid logic)
            const width = this.resolveWidth(data, i, p);

            // 2. compute left/right in data space
            const x0 = p.x - width / 2;
            const x1 = p.x + width / 2;

            // 3. transform to screen space
            const left = transform.map(x0, 0);
            const right = transform.map(x1, 0);
            const top = transform.map(p.x, p.y);
            const base = transform.map(p.x, 0); // baseline (y = 0 in data space)

            // prevents bars from disappearing when zoomed out
            // makes charts visually stable
            const screenWidth = Math.max(
                right.x - left.x,
                this.minWidthPx
            );

            const height = base.y - top.y;

            ctx.fillRect(
                left.x,
                top.y,
                screenWidth,
                height
            );

        }

        ctx.restore();

    }

    /**
     * Hybrid width resolver
     * 
     * @remarks
     * Can later swap strategies
     * - histogram mode
     * - time-series mode
     * - categorical spacing
     * 
     * @param data 
     * @param i 
     * @param p 
     * @returns 
     */
    private resolveWidth(data: DataPoint[], i: number, p: DataPoint): number {

        // option A: user-provided width
        if (p.width !== undefined) {

            /**
             * Be aware of overlapping bars
             * if user does:
             * [
             *  {x: 1, y: 10, width: 2},
             *  {x: 2, y: 15, width: 2}
             * ]
             * the bars will overlap and
             * the engine will not prevent it, and shouldn't
             * this is because overlapping is data problem, not a rendering problem
             */
            return p.width;

        }

        // option B: infer from neighbors
        const prev = data[i - 1];
        const next = data[i + 1];


        let dx: number = 1;

        if (prev && next) {

            // average spacing (more stable)
            dx = (next.x - prev.x) / 2;

        } else if (next) {

            dx = next.x - p.x;

        } else {

            // single point fallback
            dx = 1;
        }

        return dx * this.gapRatio;
        
    }

}
