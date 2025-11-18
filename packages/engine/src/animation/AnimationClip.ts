import type { KeyFrameTrack } from "./KeyframeTrack";
import { NormalAnimationBlendMode, AnimationBlendMode } from "../constants";

/**
 * A reusable set of keyframe tracks representing an animation.
 */
export class AnimationClip {
  /**
   * Constructs a new animation clip.
   *
   * @remarks
   * Instead of instantiating an AnimationClip directly with the constructor, you can
   * use the static interface of this class for creating clips. In most cases though,
   * animation clips will automaticall be created by loaders when importing animated
   * 3D assets
   *
   * @param name - The clip's name
   * @param duration - The clip's duration in seconds. If a negative value is passed,
   * the duration will be calculated from the passed keyframes.
   * @param tracks - An array of keyframe tracks
   * @param blendMode - Defines how the animation is blended/combined when two or more
   * animations are simultaneously played
   */
  constructor(
    public name: string ='',
    duration: number = -1,
    tracks: KeyFrameTrack[] = [],
    blendMode: AnimationBlendMode = NormalAnimationBlendMode
  ) {

  }
}
