
export enum SimBindingType {
    Direct,
    HasCopy
    // EntireArray,
    // HasFromToArray,
};

// After writing to this property, what extra update flag
// must be set so the engine recomputes dependent data?
export enum SimVersioning {
    None,
    NeedsUpdate,
    MatrixWorldNeedsUpdate
}

export class SimPropertyBinding {

    private targetObject: any;
    private propertyName: string;
    // private propertyIndex: string | number;
    public resolveProperty: any;
    public physicsProperty: any;

    public getValue = this._getValue_unbound;
    public setValue = this._setValue_unbound;

    public static GetterByBindingType = [
        // SimPropertyBinding.prototype._getValue_direct,
        // SimPropertyBinding._getValue_array,
        // SimPropertyBinding._getValue_toArray
    ];

    public static SetterByBindingTypeAndVersioning = [
        [
            // direct
            SimPropertyBinding.prototype._setValue_direct,
            SimPropertyBinding.prototype._setValue_direct_setNeedsUpdate,
            SimPropertyBinding.prototype._setValue_direct_setMatrixWorldNeedsUpdate
        ],
        [
            // hasCopy
            SimPropertyBinding.prototype._setValue_hasCopy,
            SimPropertyBinding.prototype._setValue_hasCopy_setNeedsUpdate,
            SimPropertyBinding.prototype._setValue_hasCopy_setMatrixWorldNeedsUpdate
        ]
    ];

    constructor(
        targetObject: any,
        // resolvedProperty: any,
        propertyName: string,
        physicsProperty: any
    ) {

        this.targetObject = targetObject;
        // this.resolveProperty = resolvedProperty;
        this.propertyName = propertyName;
        this.resolveProperty = targetObject[this.propertyName];
        this.physicsProperty = physicsProperty;

        // console.log(typeof targetObject, typeof resolvedProperty, typeof physicsProperty)

    }


    private _getValue_unbound() {

        this.bind();
        this.getValue();

    }

    private _setValue_unbound() {

        this.bind();
        this.setValue();
    }

    // these are used to bind to a non existent property
    private _getValue_unavailable() { };
    private _setValue_unavailable() { };

    // direct
    private _setValue_direct() {

        this.targetObject[this.propertyName] = this.physicsProperty;

    }

    private _setValue_direct_setNeedsUpdate() {

        this.targetObject[this.propertyName] = this.physicsProperty;
        this.targetObject.needsUpdate = true;

    }

    private _setValue_direct_setMatrixWorldNeedsUpdate() {

        this.targetObject[this.propertyName] = this.physicsProperty;
        this.targetObject.matrixWorldNeedsUpdate = true;

    }

    // hasCopy  TODO: check if using array is more efficient
    private _setValue_hasCopy() {

        this.resolveProperty.copy(this.physicsProperty);

    }

    private _setValue_hasCopy_setNeedsUpdate() {

        this.resolveProperty.copy(this.physicsProperty);
        // confirm if we need to update on physics step
        // rumours have it that you only update on animation run
        this.targetObject.needsUpdate = true;

    }

    private _setValue_hasCopy_setMatrixWorldNeedsUpdate() {

        this.resolveProperty.copy(this.physicsProperty);
        // confirm if we need to update on physics step
        // rumours have it that you only update on animation run
        this.targetObject.matrixWorldNeedsUpdate = true;

    }

    /**
     * Creates a getter / setter pair for the property tracked by this binding
     */
    public bind() {

        if (!this.targetObject) {

            throw new Error('SimPropertyBinding: No targetObject found');

        }

        // set failt state so we can just return on error
        this.getValue = this._getValue_unavailable;
        this.setValue = this._setValue_unavailable;

        const property = this.resolveProperty;

        // determine the binding type
        let bindingType: number;
        if (property.copy) {

            bindingType = SimBindingType.HasCopy;

            // } else if (property.toArray !== undefined && property.fromArray !== undefined) {

            //     bindingType = SimBindingType.HasFromToArray;

            // } else if (Array.isArray(property)) {

            //     bindingType = SimBindingType.EntireArray;

        } else {

            bindingType = SimBindingType.Direct;
        }

        // determine the versioning schema
        let versioning = SimVersioning.None;

        if (
            this.propertyName === "position" ||
            this.propertyName === "rotation" ||
            this.propertyName === "quaternion" ||
            this.propertyName === "scale"
        ) {

            versioning = SimVersioning.MatrixWorldNeedsUpdate;

        }

        if (this.targetObject.isMaterial) {

            versioning = SimVersioning.NeedsUpdate;

        }

        this.getValue = SimPropertyBinding.GetterByBindingType[bindingType];
        this.setValue = SimPropertyBinding.SetterByBindingTypeAndVersioning[bindingType][versioning];

    }

}