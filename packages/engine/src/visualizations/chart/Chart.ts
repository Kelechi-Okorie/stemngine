import { BaseContext } from "./Interfaces";
import { GridLayout } from "./core/GridLayout";
import { PlotArea } from "./core/PlotArea";

/**
 * TODO: Add the following:
 * - spacing between subplots
 * - overlays
 * 
 * - inverse transforms (screen -> data)
 * which enables:
 * - mouse hover coordinates
 * - zoom
 * - pan
 * - crosshair
 */

// TODO: use two canvases for charts. background and foreground

/**
 * Chart = layout engine (grid)
 * 
 */
export class Chart {

    private layout: GridLayout;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private grid: PlotArea[][] = [];

    constructor(canvas: HTMLCanvasElement, layout: GridLayout) {

        const ctx = canvas.getContext('2d');

        if (ctx === null) {

            throw new Error('Chart: context cannot be created');

        }

        this.canvas = canvas;
        this.ctx = ctx;
        this.layout = layout;

        for (let row = 0, nRows = layout.rows, nCols = layout.cols; row < nRows; row++) {

            this.grid[row] = new Array(nCols);

        }

    }

    public addPlotArea(row: number, col: number, plotArea: PlotArea) {

        // TODO: may be necessary to check for row < 0 || col < 0;

        if (row > this.layout.rows || col > this.layout.cols) {

            // TODO: maybe throw an error here
            console.error(`Chart: addPlotArea too much row or colums`)

        }


        this.grid[row][col] = plotArea;

    }

    public draw(width?: number, height?: number) {

        // TODO: might need to clear canvas before drawing

        // TODO: might need to check for -ve values
        if (width === undefined || height === undefined) {

            width = this.canvas.clientWidth;
            height = this.canvas.clientHeight;

        }

        for (let row = 0, nRows = this.grid.length; row < nRows; row++) {

            for (let col = 0, nCols = this.grid[row].length; col < nCols; col++) {

                const plotArea = this.grid[row][col];

                if (!plotArea) continue;

                // 1. compute viewport for this cell
                const rect = this.layout.getCellRect(row, col, width, height);

                const baseContext: BaseContext = {
                    renderer: this.ctx,
                    viewport: rect
                }

                // 2. then draw each plotArea
                plotArea.draw(baseContext);
            }
            
        }

    }

}
