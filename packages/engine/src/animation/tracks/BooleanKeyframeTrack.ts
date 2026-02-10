import { InterpolateDiscrete, InterpolateLinear, InterpolateSmooth, AnyTypedArray, InterpolationMode } from '../../constants';
import { KeyframeTrack } from '../KeyframeTrack';

/**
 * A track for boolean keyframe values.
 *
 * @augments KeyframeTrack
 */
export class BooleanKeyframeTrack extends KeyframeTrack {

	/**
	 * The value type name.
	 *
	 * @type {string}
	 * @default 'bool'
	 */
	public ValueTypeName: string = 'bool';

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

	// public InterpolantFactoryMethodLinear: (result: AnyTypedArray) => LinearInterpolant | undefined = undefined;
	// public InterpolantFactoryMethodSmooth = undefined;


	/**
	 * Constructs a new boolean keyframe track.
	 *
	 * This keyframe track type has no `interpolation` parameter because the
	 * interpolation is always discrete.
	 *
	 * @param {string} name - The keyframe track's name.
	 * @param {Array<number>} times - A list of keyframe times.
	 * @param {Array<boolean>} values - A list of keyframe values.
	 */
	constructor(name: string, times: number[], values: boolean[]) {

		super(name, times, values);

	}

}
