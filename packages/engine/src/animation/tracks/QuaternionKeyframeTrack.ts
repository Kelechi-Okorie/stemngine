import { KeyframeTrack } from '../KeyframeTrack';
import { QuaternionLinearInterpolant } from '../../math/interpolants/QuaternionLinearInterpolant';
import { AnyTypedArray, InterpolationMode } from '../../constants';

/**
 * A track for Quaternion keyframe values.
 *
 * @augments KeyframeTrack
 */
export class QuaternionKeyframeTrack extends KeyframeTrack {

	/**
	 * The value type name.
	 *
	 * @type {string}
	 * @default 'quaternion'
	 */
	public ValueTypeName: string = 'quaternion';
	// ValueBufferType is inherited
	// DefaultInterpolation is inherited;
	// public InterpolantFactoryMethodSmooth = undefined;

	/**
	 * Constructs a new Quaternion keyframe track.
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

	/**
	 * Overwritten so the method returns Quaternion based interpolant.
	 *
	 * @static
	 * @param {TypedArray} [result] - The result buffer.
	 * @return {QuaternionLinearInterpolant} The new interpolant.
	 */
	public InterpolantFactoryMethodLinear(result: AnyTypedArray): QuaternionLinearInterpolant  {

		return new QuaternionLinearInterpolant(this.times, this.values, this.getValueSize(), result);

	}

}
