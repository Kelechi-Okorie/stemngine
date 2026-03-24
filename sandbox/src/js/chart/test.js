import { Chart, StaticArraySource, StreamingSource, Series, Color } from '@stemngine/engine';
// import { PointAttribute, DataSourceOptions, SeriesOptions } from '@stemngine/engine';

const data = [
    0, 50,
    1, 55,
    2, 60
];

const staticSource = new StaticArraySource({
    buffer: data,
    stride: 2,
    count: 3,
    attributes: [
        {name: 'position', size: 2, offset: 0}
    ]
});

const staticSeriesConfig = {
    name: 'ref',
    dataSource: staticSource,
    type: 'line',
    color: new Color(0x00ff00),
    lineWidth: 1
}

const referenceLine = new Series(staticSeriesConfig);

const liveSource = new StreamingSource({
    stride: 2,
    count: 1000,
    attributes: [
        {name: 'position - streaminig', size: 2, offset: 0}
    ]
});

const liveSeriesConfig = {
    name: 'live',
    dataSource: liveSource,
    type: 'line',
    color: new Color(0xff0000),
    lineWidth: 1
}

const liveSignal = new Series(liveSeriesConfig);

// chart
// const chart = new Chart(renderer, controller);
// chart.addSeries(referenceLine);
// chart.addSeries(liveSignal);

// // simulate live updates
// setInterval(() => {
//     const t = performance.now() / 1000;
//     liveSource.emit({x: t, y: 50 + 10 * Math.sin(t)});
//     chart.update(); // redraw chart with new point
// }, 16);

console.log(referenceLine, liveSignal);