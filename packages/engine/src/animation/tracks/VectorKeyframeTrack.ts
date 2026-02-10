import { InterpolationMode } from '../../constants';
import { KeyframeTrack } from '../KeyframeTrack';

/**
 * A track for vector keyframe values.
 *
 * @augments KeyframeTrack
 */
export class VectorKeyframeTrack extends KeyframeTrack {

	/**
	 * The value type name.
	 *
	 * @type {string}
	 * @default 'vector'
	 */
	public ValueTypeName: string = 'vector';
	// ValueBufferType is inherited
	// DefaultInterpolation is inherited

	/**
	 * Constructs a new vector keyframe track.
	 *
	 * @param {string} name - The keyframe track's name.
	 * @param {Array<number>} times - A list of keyframe times.
	 * @param {Array<number>} values - A list of keyframe values.
	 * @param {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)} [interpolation] - The interpolation type.
	 */
	constructor(
		name: string, 
		times: number[], 
		values: number[], 
		interpolation: InterpolationMode
	) {

		super(name, times, values, interpolation);

	}

}
