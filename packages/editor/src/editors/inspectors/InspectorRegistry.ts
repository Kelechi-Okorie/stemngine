import { Inspector } from "../../Interfaces";

export class InspectorRegistry {

    private inspectors: Inspector[] = [];

    public register(inspector: Inspector) {

        this.inspectors.push(inspector);

    }

    public getAll(): Inspector[] {

        // return this.inspectors.filter(i => i.isAvailable(context));

        return this.inspectors;

    }

    // TODO: optimize
    public getById(id: string) {

        return this.inspectors.find(i => i.id === id);

    }

}
