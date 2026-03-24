import { Viewport } from "../Interfaces";


export class GridLayout {

    public rows: number;
    public cols: number;

    constructor(rows: number, cols: number) {

        this.rows = rows;
        this.cols = cols;
    }

    public getCellRect(row: number, col: number, width: number, height: number): Viewport {

        const cellWidth = width / this.cols;
        const cellHeight = height / this.rows;

        return {
            x: col * cellWidth,
            y: row * cellHeight,
            width: cellWidth,
            height: cellHeight
        }
    }
}