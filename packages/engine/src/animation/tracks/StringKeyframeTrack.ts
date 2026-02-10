import { InterpolateDiscrete, InterpolationMode } from '../../constants';
import { KeyframeTrack } from '../KeyframeTrack';

/**
 * A track for string keyframe values.
 *
 * @augments KeyframeTrack
 */
export class StringKeyframeTrack extends KeyframeTrack {

	/**
	 * The value type name.
	 *
	 * @type {string}
	 * @default 'string'
	 */
	public ValueTypeName: string = 'string';

	/**
	 * The value buffer type of this keyframe track.
	 *
	 * @type {TypedArray|Array}
	 * @default Array.constructor
	 */
	public ValueBufferType = Array;

	/**
	 * The default interpolation type of this keyframe track.
	 *
	 * @type {(InterpolateLinear|InterpolateDiscrete|InterpolateSmooth)}
	 * @default InterpolateDiscrete
	 */
	public DefaultInterpolation: InterpolationMode = InterpolateDiscrete;
	// public InterpolantFactoryMethodLinear = undefined;
	// public InterpolantFactoryMethodSmooth = undefined;

	/**
	 * Constructs a new string keyframe track.
	 *
	 * This keyframe track type has no `interpolation` parameter because the
	 * interpolation is always discrete.
	 *
	 * @param {string} name - The keyframe track's name.
	 * @param {Array<number>} times - A list of keyframe times.
	 * @param {Array<string>} values - A list of keyframe values.
	 */
	constructor(name: string, times: number[], values: string[]) {

		super(name, times, values);

	}

}
