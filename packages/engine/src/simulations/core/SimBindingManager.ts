import { SimPropertyBinding } from "./SimPropertyBinding";

export class SimBindingManager {

    private bindings: SimPropertyBinding[] = [];

    constructor() {}

    public createBinding(targetObject: any, propertyName: string, physicsProperty: any) {

        const binding = new SimPropertyBinding(targetObject, propertyName, physicsProperty);
        this.bindings.push(binding);

    }

    public update() {

        for (let binding of this.bindings) {

            binding.setValue();
        }
    }

}