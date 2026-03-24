import { DataPoint, Plotter, RenderContext } from "../Interfaces";
import { Series } from "./Series";


export class Plot {

    public series: Series;
    private plotter: Plotter;

    //TODO: remember to remove event listeners when necessary
    private listeners = new Set<(point: DataPoint) => void>();

    constructor(series: Series, plotter: Plotter) {

        this.series = series;
        this.plotter = plotter;

        this.series.onChange((point: DataPoint) => {

            this.emit(point);
        })

    }

    public draw(renderContext: RenderContext) {

        this.plotter.draw(renderContext, this.series);

    }

    // TODO: may be better to use on('change', cb);
    public onChange(cb: (point: DataPoint) => void) {

        this.listeners.add(cb);

    }

    private emit(point: DataPoint) {

        this.listeners.forEach(cb => cb(point));

    }

}