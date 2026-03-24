import { Series } from "../core/Series";
import { Plotter, RenderContext, XAxisMode } from "../Interfaces";
import { StreamingSource } from "../sources/StreamingSource";

/**
 * 3️⃣ What can the plotter store
    Stateless doesn’t mean “completely empty.”
    Configuration: things like line color, stroke width, point size, fill style
    Rendering options: markers, dashed lines, smoothing methods
 */

export class LinePlotter implements Plotter {

    //TODO: draw should actually plot the buffer, not convert to aos

    /**
     * Plots the line
     * 
     * @param renderContext 
     * @param series 
     */
    public draw(renderContext: RenderContext, series: Series) {

        const { renderer: ctx, transform, innerViewport, xAxisMode } = renderContext

        const data = series.getData();

        ctx.beginPath();

        // sweep mode
        if (xAxisMode === XAxisMode.SWEEP) {

            const source = series.dataSource as StreamingSource;
            const buffer = source.buffer;
            const stride = source.stride;
            const count = source.getCount();
            const maxCount = source.getMaxCount();
            const head = source.getHead();

            // const visibleCount = Math.min(count, innerViewport.width); // 1px per point
            // const visibleCount = 1000;

            const xStep = innerViewport.width / maxCount;
            // const xStep = innerViewport.width / visibleCount;

            const xOffset = source.attributes.find(a => a.name === 'x')!.offset;
            const yOffset = source.attributes.find(a => a.name === 'y')!.offset;

            // oldest index
            const start = (head - count + maxCount) % maxCount;

            for (let i = 0; i < count; i++) {

                const idx = (start + i) % maxCount;
                const base = idx * stride;

                const y = buffer[base + yOffset];

                // screen-driven x
                const screenX = innerViewport.x + i * xStep;

                // y still uses transform (important)
                // in sweep mode x is time order, not position
                const s = transform.map(0, y);

                if (i === 0) {

                    ctx.moveTo(screenX, s.y);

                } else {

                    ctx.lineTo(screenX, s.y);

                }
            }


            ctx.stroke();

            // add veritical sweep line
            const cursorX = innerViewport.x + (head % maxCount) * xStep;

            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(cursorX, innerViewport.y);
            ctx.lineTo(cursorX, innerViewport.y + innerViewport.height);
            ctx.stroke();

            return;
        }

        // normal modes: (fixed, expand, scroll)
        data.forEach((p, i) => {

            const s = transform.map(p.x, p.y);

            if (i === 0) {

                ctx.moveTo(s.x, s.y);

            } else {

                ctx.lineTo(s.x, s.y);

            }
        });

        ctx.stroke();

    }

}
