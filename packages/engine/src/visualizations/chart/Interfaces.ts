import { Axes } from './core/Axes';
import { Series } from './core/Series';

export type DataPoint = {
    x: number;
    y: number;
};

export interface PointAttribute {
    name: string;
    offset: number;
    // size: number;
};

export interface BufferLayout {
    buffer: Float32Array;
    stride: number;
    count: number;
    attributes: PointAttribute[];
};

export interface DataSourceOptions {
    type: DataSourceTypes;
    data?: Record<string, number>[] | Record<string, number[]> | Float32Array;
    maxCount?: number;  // max count for max size of streaming buffer
    schema?: string[];
    layout?: BufferLayout;
};

export enum DataSourceTypes {
    AOS,    // [{x, y}, {x, y,...}]
    SOA,
    BUFFER,
    STREAM
}

/**
 * Abstract interface for any data provider
 * 
 * Types of DataSource
 * - StaticArraySource -> full dataset known upfront
 * - StreamingSource -> emits data in real-time, keeps sliding buffer
 * - HybridSource -> combination (static reference + live updates)
 */
export interface DataSource {
    buffer: Float32Array;
    stride: number;
    subscribe(callback: (point: DataPoint) => void): void;
    unsubscribe(callback: (point: DataPoint) => void): void;
    getData(): DataPoint[];
};

/**
 * Only redraw the sliding window region
 * TODO: Batch drawing multiple points in one call (WebGL line strip or Canvas path)
 */
export interface Plotter {

    draw(renderContext: RenderContext, series: Series): void;   // draw the series
};

/**
 * 1. Generate tick values (data space)
 * 2. Convert them to screen positions (via transform)
 * 3. Draw lines + ticks + labels
 */
export interface Axis {
    min: number;
    max: number;

    majorTickCount: number;
    minorTickCount: number;
    label: string;

    // generate tick values in data space
    getTicks(): { major: number[], minor: number[] }
};

/**
 * Viewport -> defines screen rectangle
 */
export type Viewport = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export interface Transform {
    map(x: number, y: number): { x: number; y: number };
}

export interface BaseContext {
    renderer: CanvasRenderingContext2D;
    viewport: Viewport;
};

export interface RenderContext {
    renderer: CanvasRenderingContext2D;
    viewport: Viewport;
    axes: Axes;
    xAxisMode: XAxisMode,
    yAxisMode: YAxisMode,
    innerViewport: Viewport;
    transform: Transform;
    // time?: number;
    // theme: Theme;
};

export enum XAxisMode {
    FIXED,
    EXPAND,
    SCROLL,
    SWEEP
};

export enum YAxisMode {
    FIXED,
    EXPAND,
    SCROLL
};

export enum PlotType {
    POINT,
    LINE,
    BAR
};
