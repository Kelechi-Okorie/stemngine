import { BaseContext, DataPoint, RenderContext, XAxisMode, YAxisMode } from "../Interfaces";
import { ViewportTransform } from "../transforms/ViewportTransform";
import { Axes } from "./Axes";
import { Plot } from "./Plot";
import { TransformPipeline } from "./TransformPipeline";

/**
 * Now we have three coordinate regions
 * 1. Data space
 * 2. Plot area (inner viewport)
 * 3. Layout space (outer viewport)
 * 
 * And:
 * Transform maps -> Data -> Plot Area
 * Axes layout uses -> Plot Area + Margins
 */

/**
 * Recommended order of implementation
 * 
 * 1. Gridlines
 * 2. Axis labels
 * 3. Title
 * 4. Legend
 * 5. Auto-margin
 * 6. Multi-axis
 */

/**
 * Chart
 * - GridLayout
 * - PlotArea
 *      - Layout -> margins, title, labels
 *      - Axes -> ticks, gridlines
 *      - Plots -> data rendering
 *      - Legend
 */

/**
 * PlotArea -> binds Axes + Viewport + Plots
 * 
 * represents a plotting region
 */
export class PlotArea {

    private axes: Axes;
    private plots: Plot[];  // TODO: make fast, maybe a Map or a Set or something faster
    private needsRedraw = true;

    private xAxisMode: XAxisMode = XAxisMode.SCROLL;
    private yAxisMode: YAxisMode = YAxisMode.FIXED;

    private windowSize = 100;

    public shouldDrawGrid: boolean = true;

    constructor(axes: Axes, plots: Plot[]) {    // TODO: should accept both a Plot or a Plot[]

        this.axes = axes;
        this.plots = plots;

        for (const plot of plots) {

            plot.onChange((point: DataPoint) => {
                this.update(point);

            });

        }

    }

    public draw(baseContext: BaseContext) {

        // TODO: may be removed
        if (!this.needsRedraw) {

            return;

        }

        this.needsRedraw = false;

        const { renderer, viewport } = baseContext;
        const ctx = renderer;

        const { major: yTickMajor, minor: yTickMinor } = this.axes.yAxis.getTicks();

        /**
         * Before deciding on margins, ask how big are the labels I'm going to draw
         * 
         * so the flow becomes:
         * 1. generate ticks
         * 2. convert ticks -> string
         * 3. measure text size
         * 4. compute margins
         * 5. build plot/inner viewport
         * 6. render everything
         */
        const maxYLabelWidth = this.computeMaxYLabelWidth(ctx, yTickMajor);
        const xLabelHeight = this.computeXLabelHeight(ctx);

        // TODO: put magic numbers in variables
        // build margins
        const margin = {
            left: maxYLabelWidth + 40,   // space for y tick labels
            right: 10,
            top: 20,                     // for title later
            bottom: xLabelHeight + 10   // space for x tick labels
        }

        // build innerViewport
        const innerViewport = {
            x: viewport.x + margin.left,
            y: viewport.y + margin.top,
            width: viewport.width - margin.left - margin.right,
            height: viewport.height - margin.top - margin.bottom
        };

        const transform = new TransformPipeline([
            this.axes.getDataToNormalized(),
            new ViewportTransform(innerViewport) // TODO: might be bad to create ViewportTransform every draw
        ]);

        const rc: RenderContext = {
            renderer,
            viewport,
            innerViewport,
            axes: this.axes,
            transform,
            xAxisMode: this.xAxisMode,
            yAxisMode: this.yAxisMode
        };

        // TODO: might need to destructure first
        // TODO: check that viewport is the correct viewport for the correct plotarea
        ctx.clearRect(
            viewport.x,
            viewport.y,
            viewport.width,
            viewport.height
        );

        // [ bottom ]
        // background
        // gridlines
        // data
        // axes (ticks + labels)
        // [ top ]

        // 1. background
        // this.drawBackground(rc);

        // 2. gridlines (behind data)
        if (this.shouldDrawGrid) {

            this.axes.drawGrid(rc);

        }

        ctx.save();

        // 3. clip to plot area
        ctx.beginPath();
        ctx.rect(
            innerViewport.x,
            innerViewport.y,
            innerViewport.width,
            innerViewport.height
        );
        ctx.clip();

        // 4. draw plots
        for (const plot of this.plots) {

            plot.draw(rc);

            this.drawLegends(rc);

        }

        ctx.restore();

        // 5. axes (ticks, labels, lines ON TOP of everything)
        this.axes.drawAxes(rc);

    }

    /**
     * Background is anything that fills or decorates the plot area before data is drawn
     * 
     * prepares the canvas region for plotting
     * 
     * @remarks
     * Why this matters:
     * without this:
     * - previous frames may bleed throuh
     * - gridlines/data stack incorrectly
     * - transparency artifacts appear
     * 
     * so this is your canvas reset for that region
     * 
     * Contains:
     * - plot area fill (required)
     * - optional decorators (borders, gradients, highlights)
     * clipping region (very important)
     * 
     * @param renderContext 
     */
    private drawBackground(renderContext: RenderContext) {

        /**
         * What can go here
         * 1. plot area fill
         * ctx.fillStyle = '#ffffff' // or dark mode
         * 
         * 2. plot border
         * ctx.strokeStyle = '#ccc'
         * ctx.strokeRect(...)
         * 
         * 3. gradient backgrounds
         * const grad = ctx.createLinearGradient(...)
         * ctx.fillStyle = grad
         * 
         * 4. highlight region (very useful)
         * // highlight x between 2 and 4
         * const p1 = transform.map(2, yMin)
         * const p2 = transform.map(4, yMax)
         * 
         * ctx.fillStyle = 'rgba(255, 0, 0, 0.1)
         * ctx.fillRect(p1.x, innerViewport.y, p2.x - p1.x, innerViewport.height)
         * 
         * 5. heatmap / density backgrounds
         * later:
         * - contour plots
         * - heatmaps
         * - shaded confidence regions
         * 
         * 6. clipping region ( important )
         * ctx.beginPath();
         * ctx.rect(
         * innerViewport.x,
         * innerViewport.y,
         * innerViewport.width,
         * innerViewport.height
         * )
         */

        const { renderer: ctx, innerViewport } = renderContext;
        const { x, y, width, height } = innerViewport;

        ctx.save();

        // 1. clip to plot area
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        // 2. fill plot area
        ctx.fillStyle = "ffffff"
        ctx.fillRect(x, y, width, height);

        ctx.restore();

    }

    // TODO: may later move to its own class
    private drawLegends(renderContext: RenderContext) {

        const { renderer: ctx, viewport, innerViewport } = renderContext;

        let lx = innerViewport.x + innerViewport.width - 80;    // TODO: put magic  number in variable
        let ly = innerViewport.y + 10;  // TODO: put magic number in variable

        for (const plot of this.plots) {

            const series = plot.series;

            // ctx.fillStyle = series.color;
            ctx.fillStyle = 'blue';
            ctx.fillRect(lx, ly, 10, 10); // TODO: put magic number in a variable

            ctx.fillStyle = 'black';
            ctx.fillText(series.name, lx + 20, ly + 10);    // TODO: put magic number in a variable

            ly += 15;   // TODO: put magic number in a variable
        }
    }

    private update(point: DataPoint) {

        const { x } = point;

        // const maxX = Math.max(this.axes.xAxis.max, x);
        const latestX = x;

        switch (this.xAxisMode) {

            case XAxisMode.EXPAND:

                this.axes.xAxis.max = latestX;
                break;

            case XAxisMode.SCROLL:
                this.axes.xAxis.min = latestX - this.windowSize;
                this.axes.xAxis.max = latestX;
                break;

            case XAxisMode.FIXED:
                // do nothing to axis
                break;

            default:
                break;
        }

        this.needsRedraw = true;

    }

    /**
     * Measure y-axis label widths
     * 
     * @param ctx 
     * @param ticks 
     */
    private computeMaxYLabelWidth(
        ctx: CanvasRenderingContext2D,
        ticks: number[]
    ): number {

        let maxWidth = 0;

        for (const t of ticks) {

            const label = t.toFixed(2) // or formatter later
            const metrics = ctx.measureText(label);
            maxWidth = Math.max(maxWidth, metrics.width);

        }

        return maxWidth;

    }

    /**
     * Measure x-axis label heights
     * 
     * @remarks
     * height is tricker because canvas does not give it directly
     * @param ctx 
     * @returns 
     */
    private computeXLabelHeight(
        ctx: CanvasRenderingContext2D
    ): number {

        const metrics = ctx.measureText("0"); // any sample text

        const height = (metrics.actualBoundingBoxAscent || 8) + (metrics.actualBoundingBoxDescent || 2);

        return height;
    }

}
