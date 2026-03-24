import { Color } from "../../../math/Color";
import { DataSource, DataPoint } from "../Interfaces";

export type Type = 'line' | 'scatter' | 'bar';

type ConfigOptions = {
    name: string;
    color: Color;
    lineWidth: number;
    dataSource: DataSource
}

export type SeriesOptions = ConfigOptions;

let _seriesId = 0;

/**
 * Each plot is a series
 * 
 * The series subscribes to its DataSource and updates the internal
 * buffer automatically
 * 
 * @remarks
 * Series doesn't care if the data is static or live; it just consumes points
 * from its DataSource
 */
export class Series {

    public id: number = _seriesId++;
    public name: string
    public dataSource: DataSource;
    public color: Color;
    public lineWidth: number = 1.2;

    private listeners = new Set<(point: DataPoint) => void>();

    constructor(config: ConfigOptions) {

        const { name, color, lineWidth, dataSource } = config;

        this.name = name;
        this.color = color;
        this.lineWidth = lineWidth;
        this.dataSource = dataSource;

        dataSource.subscribe((point: DataPoint) => {
            // update internal state

            this.emit(point);
        });
        
    }

    public getData():  {x: number, y: number}[] {

        return this.dataSource.getData();

    }

    // TODO: remember to add removeEventListener
    public onChange(cb: (point: DataPoint) => void) {

        this.listeners.add(cb);
    }

    private emit(point: DataPoint) {

        this.listeners.forEach(cb => cb(point));

    }
}