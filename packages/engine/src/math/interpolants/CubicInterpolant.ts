import { ZeroCurvatureEnding, WrapAroundEnding, ZeroSlopeEnding, AnyTypedArray } from '../../constants';
import { Interpolant } from '../Interpolant';

export interface CubicSettings {
  endingStart: number; // enum-like
  endingEnd: number;   // enum-like
}

/**
 * Fast and simple cubic spline interpolant.
 *
 * It was derived from a Hermitian construction setting the first derivative
 * at each sample position to the linear slope between neighboring positions
 * over their parameter interval.
 *
 * @augments Interpolant
 */
export class CubicInterpolant extends Interpolant<CubicSettings> {

	public _weightPrev = - 0;
	public _offsetPrev = - 0;
	public _weightNext = - 0;
	public _offsetNext = - 0;

	/**
	 * Constructs a new cubic interpolant.
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

		super(parameterPositions, sampleValues, sampleSize, resultBuffer);

		this.DefaultSettings_ = {

			endingStart: ZeroCurvatureEnding,
			endingEnd: ZeroCurvatureEnding

		};

	}

	public intervalChanged_(i1: number, t0: number, t1: number): void {

		const pp = this.parameterPositions;
		let iPrev = i1 - 2,
			iNext = i1 + 1,

			tPrev = pp[iPrev],
			tNext = pp[iNext];

		if (tPrev === undefined) {

			switch (this.getSettings_().endingStart) {

				case ZeroSlopeEnding:

					// f'(t0) = 0
					iPrev = i1;
					tPrev = 2 * t0 - t1;

					break;

				case WrapAroundEnding:

					// use the other end of the curve
					iPrev = pp.length - 2;
					tPrev = t0 + pp[iPrev] - pp[iPrev + 1];

					break;

				default: // ZeroCurvatureEnding

					// f''(t0) = 0 a.k.a. Natural Spline
					iPrev = i1;
					tPrev = t1;

			}

		}

		if (tNext === undefined) {

			switch (this.getSettings_().endingEnd) {

				case ZeroSlopeEnding:

					// f'(tN) = 0
					iNext = i1;
					tNext = 2 * t1 - t0;

					break;

				case WrapAroundEnding:

					// use the other end of the curve
					iNext = 1;
					tNext = t1 + pp[1] - pp[0];

					break;

				default: // ZeroCurvatureEnding

					// f''(tN) = 0, a.k.a. Natural Spline
					iNext = i1 - 1;
					tNext = t0;

			}

		}

		const halfDt = (t1 - t0) * 0.5,
			stride = this.valueSize;

		this._weightPrev = halfDt / (t0 - tPrev);
		this._weightNext = halfDt / (tNext - t1);
		this._offsetPrev = iPrev * stride;
		this._offsetNext = iNext * stride;

	}

	public interpolate_(i1: number, t0: number, t: number, t1: number): AnyTypedArray {

		const result = this.resultBuffer,
			values = this.sampleValues,
			stride = this.valueSize,

			o1 = i1 * stride, o0 = o1 - stride,
			oP = this._offsetPrev, oN = this._offsetNext,
			wP = this._weightPrev, wN = this._weightNext,

			p = (t - t0) / (t1 - t0),
			pp = p * p,
			ppp = pp * p;

		// evaluate polynomials

		const sP = - wP * ppp + 2 * wP * pp - wP * p;
		const s0 = (1 + wP) * ppp + (- 1.5 - 2 * wP) * pp + (- 0.5 + wP) * p + 1;
		const s1 = (- 1 - wN) * ppp + (1.5 + wN) * pp + 0.5 * p;
		const sN = wN * ppp - wN * pp;

		// combine data linearly

		for (let i = 0; i !== stride; ++i) {

			result[i] =
				sP * values[oP + i] +
				s0 * values[o0 + i] +
				s1 * values[o1 + i] +
				sN * values[oN + i];

		}

		return result;

	}

}
