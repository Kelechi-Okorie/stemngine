import { Axis, RenderContext } from "../Interfaces";
import { LinearScaleTransform } from "../transforms/LinearTransform";
import { LinearAxis } from "../Axis/LinearAxis";

export type ConfigOptions = {
    xMin: number;
    xMax: number;
    xTickMajorCount: number;
    xTickMinorCount: number;
    xLabel: string;
    yMin: number;
    yMax: number;
    yTickMajorCount: number;
    yTickMinorCount: number;
    yLabel: string;
    title: string;
};

type Ticks = { t: number; x: number; y: number; }[];

/**
 * 1. Axis (xAxis, yAxis) -> generate ticks (data space)
 * 2. Axes -> use transform -> convert to screen
 * 3. Canvas -> draw lines + labels
 * 
 * TODO:
 * 1. nice ticks algorithm
 * 2. axis padding (so data isn't glued to edges)
 * 3. inverse transform -> mouse interaction
 */

/**
 * Axes -> define coordinate system
 * 
 */
export class Axes {

    public xAxis: Axis;
    public yAxis: Axis;
    public title: string;

    public shouldDrawMinorGrid = false;

    constructor(config: ConfigOptions) {

        const { xMin, xMax, xTickMajorCount, xTickMinorCount, xLabel, yMin, yMax, yTickMajorCount, yTickMinorCount, yLabel, title } = config;

        this.title = title || 'plot of y against x';

        // const { xMin}
        const xAxisConfig = {
            min: xMin,
            max: xMax,
            majorTickCount: xTickMajorCount,
            minorTickCount: xTickMinorCount,
            label: xLabel
        };
        this.xAxis = new LinearAxis(xAxisConfig);

        const yAxisConfig = {
            min: yMin,
            max: yMax,
            majorTickCount: yTickMajorCount,
            minorTickCount: yTickMinorCount,
            label: yLabel
        };
        this.yAxis = new LinearAxis(yAxisConfig);

    }

    public getDataToNormalized() {

        // TODO: not good to return new object everytime. refactor
        // TODO: too much object lookup. refactor
        // TODO: should not hard code LinearScaleTransform, other transforms
        // may be needed later
        return new LinearScaleTransform(
            this.xAxis.min,
            this.xAxis.max,
            this.yAxis.min,
            this.yAxis.max
        );
    }

    public drawGrid(renderContext: RenderContext) {

        const { renderer: ctx, innerViewport, transform } = renderContext;

        // TODO: it would probably be bettr to only generate minor ticks when needed
        const { major: xTickMajor, minor: xTickMinor } = this.xAxis.getTicks();
        const { major: yTickMajor, minor: yTickMinor } = this.yAxis.getTicks();

        const xTicks = xTickMajor.map(t => {
            const p = transform.map(t, this.yAxis.min);
            return {
                t,
                x: Math.round(p.x) + 0.5, // snap for vertical lines,
                y: p.y
            };
        });

        const yTicks = yTickMajor.map(t => {
            const p = transform.map(this.xAxis.min, t);
            return {
                t,
                x: p.x,
                y: Math.round(p.y) + 0.5, // snap for horizontal lines
            };
        });


        const xTicksMinor = xTickMinor.map(t => {
            const p = transform.map(t, this.yAxis.min);
            return {
                t,
                x: Math.round(p.x) + 0.5, // snap for vertical lines,
                y: p.y
            };
        });

        const yTicksMinor = yTickMinor.map(t => {
            const p = transform.map(this.xAxis.min, t);
            return {
                t,
                x: p.x,
                y: Math.round(p.y) + 0.5, // snap for horizontal lines
            };
        });



        ctx.save();

        // ---- minor grid (draw first, lighter)
        if (this.shouldDrawMinorGrid) {

            // TODO: put magic number and magic color in variables
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 1;

            ctx.beginPath();

            // vertical gridlines (x ticks)
            for (const p of xTicksMinor) {

                ctx.moveTo(p.x, innerViewport.y);
                ctx.lineTo(p.x, innerViewport.y + innerViewport.height);
            }

            // horizontal gridlines (y ticks)
            for (const p of yTicksMinor) {

                ctx.moveTo(innerViewport.x, p.y);
                ctx.lineTo(innerViewport.x + innerViewport.width, p.y);
            }

            ctx.stroke();

        }

        // ---- major grid (draw on top minor grid, darker)
        // TODO: put magic number and magic color in variables
        ctx.strokeStyle = '#ccc';   // light gray
        ctx.lineWidth = 1.5;

        ctx.beginPath();

        // vertical gridlines (x ticks)
        for (const p of xTicks) {

            ctx.moveTo(p.x, innerViewport.y);
            ctx.lineTo(p.x, innerViewport.y + innerViewport.height);
        }

        // horizontal gridlines (y ticks)
        for (const p of yTicks) {

            ctx.moveTo(innerViewport.x, p.y);
            ctx.lineTo(innerViewport.x + innerViewport.width, p.y);
        }

        ctx.stroke();

        ctx.restore();

    }

    public drawAxes(renderContext: RenderContext) {

        // viewport -> use for layout and margins
        // innerViewport -> use for geometry tied to data

        // TODO: decide who draws the title
        // this.drawTitle(renderContext);

        const { transform } = renderContext;

        const { major: xTickMajor } = this.xAxis.getTicks();
        const { major: yTickMajor } = this.yAxis.getTicks();

        // TODO: use for naming magic numbers
        const TICK_SIZE = 5;
        const LABEL_OFFSET = 15;
        const AXIS_LABEL_OFFSET = 35;

        const xTicks = xTickMajor.map(t => {
            const p = transform.map(t, this.yAxis.min);
            return {
                t,
                x: Math.round(p.x) + 0.5, // snap for vertical lines,
                y: p.y
            };
        });

        const yTicks = yTickMajor.map(t => {
            const p = transform.map(this.xAxis.min, t);
            return {
                t,
                x: p.x,
                y: Math.round(p.y) + 0.5, // snap for horizontal lines
            };
        });

        const ticks: { xTicks: Ticks, yTicks: Ticks } = { xTicks, yTicks };

        this.drawAxisLinesAndTicks(renderContext, ticks);
        this.drawTicksLabels(renderContext, ticks);
        this.drawAxislabels(renderContext);

    }

    private drawAxisLinesAndTicks(
        renderContext: RenderContext,
        ticks: { xTicks: Ticks, yTicks: Ticks }
    ): void {

        const { renderer: ctx, innerViewport } = renderContext;
        const { xTicks, yTicks } = ticks;

        ctx.save();

        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#000';

        ctx.beginPath();

        // ---- X axis line ----
        const y0 = innerViewport.y + innerViewport.height;
        ctx.moveTo(innerViewport.x, y0);
        ctx.lineTo(innerViewport.x + innerViewport.width, y0);

        // ---- X tick marks ----
        for (const p of xTicks) {

            // tick culling
            // TODO: might need to add this everywhere tick is used
            // if (p.x < innerViewport.x || p.x > innerViewport.x + innerViewport.width) {
            //     continue;
            // }
            // OR
            // const xMin = innerViewport.x;
            // const xMax = innerViewport.x + innerViewport.width;
            // const yMin = innerViewport.y;
            // const yMax = innerViewport.y + innerViewport.height;
            // if (tick.x < xMin || tick.x > xMax) continue;
            // OR
            // if (!isVisibleX(tick)) continue;
            // so visibility becomes a reusable function

            // x ticks live at a fixed y (at y0)
            ctx.moveTo(p.x, y0);
            ctx.lineTo(p.x, y0 - 5);    // TODO: put magic number in a variable

        }

        // ---- Y axis line ----
        const x0 = innerViewport.x;
        ctx.moveTo(x0, innerViewport.y);
        ctx.lineTo(x0, innerViewport.y + innerViewport.height);

        // ---- Y tick marks ----
        for (const p of yTicks) {

            // y ticks live at a fixed y (left of axis)
            ctx.moveTo(x0, p.y);
            ctx.lineTo(x0 + 5, p.y);    // TODO: put magic number in a variable
        }

        ctx.stroke();
        ctx.restore();

    }

    private drawTicksLabels(
        renderContext: RenderContext,
        ticks: { xTicks: Ticks, yTicks: Ticks }
    ) {

        const { renderer: ctx, innerViewport } = renderContext;
        const { xTicks, yTicks } = ticks;

        const x0 = innerViewport.x;
        const y0 = innerViewport.y + innerViewport.height;

        ctx.save();

        // ---- x tick labels ----
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (const p of xTicks) {

            ctx.fillText(p.t.toFixed(2), p.x - 10, y0 + 5); // TODO: put magic number in a variable

        }

        // y tick labels
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        for (const p of yTicks) {

            // y ticks live at a fixed y (left of axis)
            ctx.fillText(p.t.toFixed(2), x0 - 5, p.y + 3);   // TODO: put magic number in a variable
        }

        ctx.restore();

    }

    private drawAxislabels(renderContext: RenderContext) {

        const { renderer: ctx, innerViewport } = renderContext;

        ctx.save();

        // ---- X axis label ----
        ctx.textAlign = 'center';
        ctx.fillText(
            this.xAxis.label,
            innerViewport.x + innerViewport.width / 2,
            innerViewport.y + innerViewport.height + 25 // TODO: rename magic number
        );

        // ---- Y axis label ----

        // TODO: put magic numbers in variables
        ctx.translate(
            innerViewport.x - 20,
            innerViewport.y + innerViewport.height / 2
        );

        ctx.rotate(-Math.PI / 2);

        ctx.textAlign = 'center';
        ctx.fillText(this.yAxis.label, 0, 0);

        ctx.restore();

    }

    // TODO: may have to move this to its own class
    public drawTitle(renderContext: RenderContext) {

        const { renderer: ctx, viewport, innerViewport } = renderContext;

        ctx.textAlign = 'center';
        ctx.fillText(
            this.title,
            innerViewport.x + innerViewport.width / 2,
            innerViewport.y/*  + 15 */
        );
    }

}
