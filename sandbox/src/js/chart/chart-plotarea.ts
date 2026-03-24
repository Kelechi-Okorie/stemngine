import { Chart, GridLayout } from '@stemngine/engine';
import { StaticArraySource, StreamingSource, Series, Color } from '@stemngine/engine';

import { PlotArea, Axes, Plot, BarPlotter, LinePlotter, PointPlotter, aosToBuffer, bufferToAOS, DataSourceTypes, PlotType } from '@stemngine/engine';

import { Pane } from 'tweakpane';

const data = [
    { x: 0, y: 1, size: 5 },
    { x: 1, y: 2, size: 10 },
    { x: 2, y: 3, size: 10 },
    { x: 3, y: 7, size: 10 },
    { x: 4, y: 0, size: 10 },
    { x: 5, y: 8, size: 10 },
    { x: 6, y: 10, size: 10 },
    { x: 7, y: 10, size: 10 },
    { x: 8, y: 10, size: 10 },
    { x: 9, y: 2, size: 10 },
    { x: 10, y: 0.5, size: 7 }
];

const staticSource = new StaticArraySource({
    type: DataSourceTypes.AOS,
    data: data,
    schema: ['x', 'y', 'size']
    // buffer: data,
    // stride: 2,
    // count: 3,
    // attributes: [
    //     {name: 'x', offset: 0, size: 1},
    //     {name: 'y', offset: 1, size: 1}
    // ]
});

const staticSeriesConfig = {
    name: 'ref',
    dataSource: staticSource,
    color: new Color(0x00ff00),
    lineWidth: 1
}

const referenceLine = new Series(staticSeriesConfig);

const liveSource = new StreamingSource({
    type: DataSourceTypes.AOS,
    data: [],
    schema: ['x', 'y', 'size']

    // stride: 2,
    // count: 1000,
    // attributes: [
    //     {name: 'x', offset: 0},
    //     {name: 'y', offset: 1}
    // ]
});

const liveSeriesConfig = {
    name: 'live',
    dataSource: liveSource,
    color: new Color(0xff0000),
    lineWidth: 1
}

const liveSignal = new Series(liveSeriesConfig);

const pointPlotter = new PointPlotter();
const linePlotter = new LinePlotter();
const barPlotter = new BarPlotter();

const canvas = document.querySelector('#plotArea') as HTMLCanvasElement;

if (canvas === null) {

    throw new Error('Canvas is null');

}

const ctx = canvas.getContext('2d');
// console.log({canvas, ctx})

// xMin, xMax, xTickCount, yMin, yMax, yTickCount
const axes1Config = {
    xMin: 0,
    xMax: 10,
    xTickMajorCount: 10,
    xTickMinorCount: 5,
    xLabel: 'x',
    yMin: 0,
    yMax: 10,
    yTickMajorCount: 10,
    yTickMinorCount: 5,
    yLabel: 'y',
    title: 'ref'
};
const axes1 = new Axes(axes1Config);
const pointPlot = new Plot(referenceLine, pointPlotter)
const linePlot = new Plot(referenceLine, linePlotter);
const barPlot = new Plot(referenceLine, barPlotter);
const plotArea1 = new PlotArea(axes1, [/* plot1,  */barPlot, pointPlot]);

const axes2Config = {
    xMin: 0,
    xMax: 10,
    xTickMajorCount: 10,
    xTickMinorCount: 5,
    xLabel: 'x',
    yMin: 0,
    yMax: 6,
    yTickMajorCount: 10,
    yTickMinorCount: 5,
    yLabel: 'y',
    title: 'live'
};

const axes2 = new Axes(axes2Config);
const livePointPlot = new Plot(liveSignal, pointPlotter);
const liveLinePlot = new Plot(liveSignal, linePlotter);
const liveBarPlot = new Plot(liveSignal, barPlotter);
const plotArea2 = new PlotArea(axes2, [/* liveBarPlot,  */liveLinePlot/* , livePointPlot */]);

const plotArea3 = new PlotArea(axes2, [livePointPlot]);

const gridLayout = new GridLayout(2, 2);

const chart = new Chart(canvas, gridLayout);

chart.addPlotArea(0, 0, plotArea1);
chart.addPlotArea(0, 1, plotArea2);
chart.addPlotArea(1, 0, plotArea2);
chart.addPlotArea(1, 1, plotArea3);


chart.draw(/* canvas.clientWidth, canvas.clientHeight */);

const data2 = [
    { x: 0, y: 1, size: 5 },
    { x: 1, y: 2, size: 10 },
    { x: 2, y: 0.5, size: 7 }
];

const layout = aosToBuffer(data2, ['x', 'y', 'size']);

let num: number = 0;

setInterval(() => {
    const t = Date.now() / 1000;

    const x = num++;
    const y = Number.parseFloat((Math.sin(t * 5) + Math.random() * 4).toFixed(2));

    liveSource.emit({ x, y });

}, 1000 / 2);

const pane = new Pane();
pane.addButton({ title: 'emit' }).on('click', () => {

    const t = Date.now() / 1000;

    const y = Number.parseFloat((Math.sin(t * 5) + Math.random() * 4).toFixed(2));

    liveSource.emit({ x: num++, y });

});

function loop() {
    chart.draw(canvas.clientWidth, canvas.clientHeight);

    requestAnimationFrame(loop);
}

loop();



// console.log(layout);
// [0, 1, 5,   1, 2, 10,   2, 0.5, 7] -> [x, y, size]

// const aos = bufferToAOS(layout);
// console.log('ths buffer', aos);

/**
 * const xAttr = attributes.find(a => a.name === 'x');
    const yAttr = attributes.find(a => a.name === 'y');
    const sizeAttr = attributes.find(a => a.name === 'size');

    const xOffset = xAttr.offset;
    const yOffset = yAttr.offset;
    const sizeOffset = sizeAttr?.offset;
 */

/**
 * for (let i = 0; i < count; i++) {
    const base = i * stride;

    const x = buffer[base + xOffset];
    const y = buffer[base + yOffset];
    const size = sizeOffset !== undefined
        ? buffer[base + sizeOffset]
        : 1;

    const s = transform.map(x, y);

    ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
}
 */


