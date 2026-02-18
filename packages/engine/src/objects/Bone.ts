import { Node3D } from '../core/Node3D';

/**
 * A bone which is part of a {@link Skeleton}. The skeleton in turn is used by
 * the {@link SkinnedMesh}.
 *
 * ```js
 * const root = new Bone();
 * const child = new Bone();
 *
 * root.add( child );
 * child.position.y = 5;
 * ```
 *
 * @augments Node3D
 */
export class Bone extends Node3D {

    /**
     * This flag can be used for type testing.
     *
     * @type {boolean}
     * @readonly
     * @default true
     */
    public readonly isBone: boolean = true;

    public type: string = 'Bone';

    /**
     * Constructs a new bone.
     */
    constructor() {

        super();

    }

}
