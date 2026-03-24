import { Plotter, RenderContext } from '../Interfaces';
import { Series } from "../core/Series";

export class PointPlotter implements Plotter {

    private radius: number = 3;
    private fillStyle: string = 'black';
    // private markerShape: 'circle' | 'square' | 'triangle';
    // private stokeStyle: string;
    // private lineWidth: number;

    // TODO: draw series buffer instead of aos

    /**
     * 
     * @param renderContext 
     * @param series 
     */
    public draw(renderContext: RenderContext, series: Series) {

        const { renderer: ctx, transform } = renderContext;
        const data = series.getData();

        ctx.beginPath();

        // TODO: the fillStyle could be part of the renderContext
        ctx.fillStyle = this.fillStyle;

        data.forEach((p) => {

            const s = transform.map(p.x, p.y);

            ctx.moveTo(s.x + this.radius, s.y);
            ctx.arc(s.x, s.y, this.radius, 0, Math.PI * 2);

        });

        ctx.fill();

    }

}
