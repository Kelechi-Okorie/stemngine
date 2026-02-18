import { AnyTypedArray } from '../../constants';
import { Interpolant } from '../Interpolant';
import { Quaternion } from '../Quaternion';

/**
 * Spherical linear unit quaternion interpolant.
 *
 * @augments Interpolant
 */
export class QuaternionLinearInterpolant extends Interpolant {

	/**
	 * Constructs a new SLERP interpolant.
	 *
	 * @param {TypedArray} parameterPositions - The parameter positions hold the interpolation factors.
	 * @param {TypedArray} sampleValues - The sample values.
	 * @param {number} sampleSize - The sample size
	 * @param {TypedArray} [resultBuffer] - The result buffer.
	 */
	constructor(
		parameterPositions: AnyTypedArray,
		sampleValues: AnyTypedArray,
		sampleSize: number,
		resultBuffer?: AnyTypedArray
	) {

		super(parameterPositions, sampleValues, sampleSize, resultBuffer);

	}

	public interpolate_(i1: number, t0: number, t: number, t1: number): AnyTypedArray {

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,

			alpha = (t - t0) / (t1 - t0);

		let offset = i1 * stride;

		for (let end = offset + stride; offset !== end; offset += 4) {

			const resultArray = Array.from(result);
			const valuesArray = Array.from(values)

			// Quaternion.slerpFlat(result, 0, values, offset - stride, values, offset, alpha);

			Quaternion.slerpFlat(resultArray, 0, valuesArray, offset - stride, valuesArray, offset, alpha);

		}

		return result;

	}

}
