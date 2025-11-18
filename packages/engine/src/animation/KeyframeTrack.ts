import { InterpolationMode, InterpolateLinear, InterpolateSmooth, InterpolateDiscrete, AnyTypedArray, TypedArrayConstructor } from "../constants";
import * as AnimationUtils from "./AnimationUtils";

/**
 * Represents a timed sequence of keyframes, which are composed of lists of
 * times and related values, and which are used to animate a specific property
 * of an object
 */
export class KeyFrameTrack {
  /**
   * The track's name can refer to morph targets or bones or possibly other
   * values within an animated object. See {@link PropertyBinding#parseTrackName}
   * for the forms of strings that can be parsed for property binding.
   */
  public name: string;

  /**
   * The keyframe times.
   */
  public times: Float32Array;

  /**
   * The keyframe values.
   */
  public values: Float32Array;

  /**
   * The interpolation type to use when calculating the values between
   * keyframes.
   */
  public interpolation: InterpolationMode;

  /**
   * Constructs a new keyframe track.
   *
   * @param name - The keyframe track's name.
   * @param times - A list of keyframe times
   * @param values - A list of keyframe values
   * @param interpolation - The interpolation type
   */
  constructor(
    name: string,
    times: number[],
    // values: (number | string | boolean)[],
    values: number[],
    interpolation: InterpolationMode = InterpolateLinear
  ) {
    this.name = name;
    this.times = AnimationUtils.convertArray(times, KeyFrameTrack.TimeBufferType) as Float32Array;
    this.values = AnimationUtils.convertArray(values, KeyFrameTrack.ValueBufferType) as Float32Array;
    this.interpolation = (interpolation || KeyFrameTrack.DefaultInterpolation) as InterpolationMode;
  }

  /**
   * The time buffer type of this keyframe track
   *
   * @default Float32Array.constructor
   */
  public static readonly TimeBufferType: TypedArrayConstructor<Float32Array> = Float32Array;

  /**
   * The value buffer type of this keyframe track.
   *
   * @default Float32Array.constructor
   */
  public static readonly ValueBufferType: TypedArrayConstructor<Float32Array> = Float32Array;


  /**
   * The default interpolation type of this keyframe track.
   */
  public static readonly DefaultInterpolation: InterpolationMode = InterpolateLinear;
}
