import { AnyTypedArray } from '../../constants';
import { Interpolant } from '../Interpolant';

/**
 * Interpolant that evaluates to the sample value at the position preceding
 * the parameter.
 *
 * @augments Interpolant
 */
export class DiscreteInterpolant extends Interpolant {

	/**
	 * Constructs a new discrete interpolant.
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
		resultBuffer: AnyTypedArray
	 ) {

		super( parameterPositions, sampleValues, sampleSize, resultBuffer );

	}

	public interpolate_( i1: number /*, t0, t, t1 */ ) {

		return this.copySampleValue_( i1 - 1 );

	}

}
