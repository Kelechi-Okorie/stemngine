import * as AnimationUtils from './AnimationUtils';
import { KeyframeTrack } from './KeyframeTrack';
import { BooleanKeyframeTrack } from './tracks/BooleanKeyframeTrack';
import { ColorKeyframeTrack } from './tracks/ColorKeyframeTrack';
import { NumberKeyframeTrack } from './tracks/NumberKeyframeTrack';
import { QuaternionKeyframeTrack } from './tracks/QuaternionKeyframeTrack';
import { StringKeyframeTrack } from './tracks/StringKeyframeTrack';
import { VectorKeyframeTrack } from './tracks/VectorKeyframeTrack';
import { generateUUID } from '../math/MathUtils';
import { AnimationBlendMode, NormalAnimationBlendMode } from '../constants';
import { warn, error } from '../utils.js';
import { JSONKeyframe } from './AnimationUtils';
import { Bone } from '../objects/Bone';

interface MorphTarget {
	name: string;              // morph target name
	vertices?: Float32Array;  // optional vertex positions
	time?: number;            // optional frame time
}

interface AnimationJSON {
	name?: string;
	fps?: number;
	blendMode?: number;
	length?: number;
	hierarchy?: {
		keys?: Array<{
			time: number;
			pos?: number[];
			rot?: number[];
			scl?: number[];
			morphTargets?: string[];	// all morph targets for this keyframe
			morphTarget?: string;	// active morph target for this keyframe
		}>;
	}[];
}

/**
 * A reusable set of keyframe tracks which represent an animation.
 * 
 * @remarks
 * example of a clip
 * |- position track
 * |- rotation track
 * |- scale track
 * |- possibly more tracks
 */
export class AnimationClip {

	/**
	 * The clip's name.
	 *
	 * @type {string}
	 */
	public name: string;

	/**
	 *  An array of keyframe tracks.
	 *
	 * @type {Array<KeyframeTrack>}
	 */
	public tracks: KeyframeTrack[];

	/**
	 * The clip's duration in seconds.
	 *
	 * @type {number}
	 */
	public duration: number;

	/**
	 * Defines how the animation is blended/combined when two or more animations
	 * are simultaneously played.
	 *
	 * @type {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)}
	 */
	public blendMode: AnimationBlendMode;

	/**
	 * The UUID of the animation clip.
	 *
	 * @type {string}
	 * @readonly
	 */
	public uuid: string = generateUUID();

	/**
	 * An object that can be used to store custom data about the animation clip.
	 * It should not hold references to functions as these will not be cloned.
	 *
	 * @type {Object}
	 */
	public userData: Record<string, any> = {};


	/**
	 * Constructs a new animation clip.
	 *
	 * Note: Instead of instantiating an AnimationClip directly with the constructor, you can
	 * use the static interface of this class for creating clips. In most cases though, animation clips
	 * will automatically be created by loaders when importing animated 3D assets.
	 *
	 * @param {string} [name=''] - The clip's name.
	 * @param {number} [duration=-1] - The clip's duration in seconds. If a negative value is passed,
	 * the duration will be calculated from the passed keyframes.
	 * @param {Array<KeyframeTrack>} tracks - An array of keyframe tracks.
	 * @param {(NormalAnimationBlendMode|AdditiveAnimationBlendMode)} [blendMode=NormalAnimationBlendMode] - Defines how the animation
	 * is blended/combined when two or more animations are simultaneously played.
	 */
	constructor(
		name: string = '',
		duration: number = - 1,
		tracks: KeyframeTrack[] = [],
		blendMode: AnimationBlendMode = NormalAnimationBlendMode
	) {

		this.name = name;

		this.tracks = tracks;

		this.duration = duration;

		this.blendMode = blendMode;

		// this means it should figure out its duration by scanning the tracks
		if (this.duration < 0) {

			this.resetDuration();

		}

	}

	/**
	 * Factory method for creating an animation clip from the given JSON.
	 *
	 * @static
	 * @param {Object} json - The serialized animation clip.
	 * @return {AnimationClip} The new animation clip.
	 */
	public static parse(json: Record<string, any>): AnimationClip {

		const tracks = [],
			jsonTracks = json.tracks,
			frameTime = 1.0 / (json.fps || 1.0);

		for (let i = 0, n = jsonTracks.length; i !== n; ++i) {

			tracks.push(parseKeyframeTrack(jsonTracks[i]).scale(frameTime));

		}

		const clip = new this(json.name, json.duration, tracks, json.blendMode);
		clip.uuid = json.uuid;

		clip.userData = JSON.parse(json.userData || '{}');

		return clip;

	}

	/**
	 * Serializes the given animation clip into JSON.
	 *
	 * @static
	 * @param {AnimationClip} clip - The animation clip to serialize.
	 * @return {Object} The JSON object.
	 */
	public static toJSON(clip: AnimationClip): Record<string, any> {

		const tracks: KeyframeTrack[] = [],
			clipTracks = clip.tracks;

		const json = {

			'name': clip.name,
			'duration': clip.duration,
			'tracks': tracks,
			'uuid': clip.uuid,
			'blendMode': clip.blendMode,
			'userData': JSON.stringify(clip.userData),

		};

		for (let i = 0, n = clipTracks.length; i !== n; ++i) {

			tracks.push(KeyframeTrack.toJSON(clipTracks[i]));

		}

		return json;

	}

	/**
	 * Returns a new animation clip from the passed morph targets array of a
	 * geometry, taking a name and the number of frames per second.
	 *
	 * Note: The fps parameter is required, but the animation speed can be
	 * overridden via {@link AnimationAction#setDuration}.
	 *
	 * @static
	 * @param {string} name - The name of the animation clip.
	 * @param {Array<Object>} morphTargetSequence - A sequence of morph targets.
	 * @param {number} fps - The Frames-Per-Second value.
	 * @param {boolean} noLoop - Whether the clip should be no loop or not.
	 * @return {AnimationClip} The new animation clip.
	 */
	public static CreateFromMorphTargetSequence(
		name: string,
		morphTargetSequence: MorphTarget[],
		fps: number,
		noLoop: boolean
	): AnimationClip {

		const numMorphTargets = morphTargetSequence.length;
		const tracks = [];

		for (let i = 0; i < numMorphTargets; i++) {

			let times = [];
			let values = [];

			times.push(
				(i + numMorphTargets - 1) % numMorphTargets,
				i,
				(i + 1) % numMorphTargets);

			values.push(0, 1, 0);

			const order = AnimationUtils.getKeyframeOrder(times);
			times = AnimationUtils.sortedArray(times, 1, order);
			values = AnimationUtils.sortedArray(values, 1, order);

			// if there is a key at the first frame, duplicate it as the
			// last frame as well for perfect loop.
			if (!noLoop && times[0] === 0) {

				times.push(numMorphTargets);
				values.push(values[0]);

			}

			tracks.push(
				new NumberKeyframeTrack(
					'.morphTargetInfluences[' + morphTargetSequence[i].name + ']',
					times, values
				).scale(1.0 / fps));

		}

		return new this(name, - 1, tracks);

	}

	/**
	 * Searches for an animation clip by name, taking as its first parameter
	 * either an array of clips, or a mesh or geometry that contains an
	 * array named "animations" property.
	 *
	 * @static
	 * @param {(Array<AnimationClip>|Object3D)} objectOrClipArray - The array or object to search through.
	 * @param {string} name - The name to search for.
	 * @return {?AnimationClip} The found animation clip. Returns `null` if no clip has been found.
	 */
	public static findByName(
		objectOrClipArray: any,	// TODO: type well
		name: string
	): AnimationClip | null {

		let clipArray = objectOrClipArray;

		if (!Array.isArray(objectOrClipArray)) {

			const o = objectOrClipArray;
			clipArray = o.geometry && o.geometry.animations || o.animations;

		}

		for (let i = 0; i < clipArray.length; i++) {

			if (clipArray[i].name === name) {

				return clipArray[i];

			}

		}

		return null;

	}

	/**
	 * Returns an array of new AnimationClips created from the morph target
	 * sequences of a geometry, trying to sort morph target names into
	 * animation-group-based patterns like "Walk_001, Walk_002, Run_001, Run_002...".
	 *
	 * See {@link MD2Loader#parse} as an example for how the method should be used.
	 *
	 * @static
	 * @param {Array<Object>} morphTargets - A sequence of morph targets.
	 * @param {number} fps - The Frames-Per-Second value.
	 * @param {boolean} noLoop - Whether the clip should be no loop or not.
	 * @return {Array<AnimationClip>} An array of new animation clips.
	 */
	public static CreateClipsFromMorphTargetSequences(
		morphTargets: MorphTarget[],
		fps: number,
		noLoop: boolean
	): AnimationClip[] {

		const animationToMorphTargets: Record<string, MorphTarget[]> = {};

		// tested with https://regex101.com/ on trick sequences
		// such flamingo_flyA_003, flamingo_run1_003, crdeath0059
		const pattern = /^([\w-]*?)([\d]+)$/;

		// sort morph target names into animation groups based
		// patterns like Walk_001, Walk_002, Run_001, Run_002
		for (let i = 0, il = morphTargets.length; i < il; i++) {

			const morphTarget = morphTargets[i];
			const parts = morphTarget.name.match(pattern);

			if (parts && parts.length > 1) {

				const name = parts[1];

				let animationMorphTargets = animationToMorphTargets[name];

				if (!animationMorphTargets) {

					animationToMorphTargets[name] = animationMorphTargets = [];

				}

				animationMorphTargets.push(morphTarget);

			}

		}

		const clips = [];

		for (const name in animationToMorphTargets) {

			clips.push(this.CreateFromMorphTargetSequence(name, animationToMorphTargets[name], fps, noLoop));

		}

		return clips;

	}

	/**
	 * Parses the `animation.hierarchy` format and returns a new animation clip.
	 *
	 * @static
	 * @deprecated since r175.
	 * @param {Object} animation - A serialized animation clip as JSON.
	 * @param {Array<Bone>} bones - An array of bones.
	 * @return {?AnimationClip} The new animation clip.
	 */
	static parseAnimation(
		animation: AnimationJSON,
		bones: Bone[]
	): AnimationClip | null {

		warn('AnimationClip: parseAnimation() is deprecated and will be removed with r185');

		if (!animation) {

			error('AnimationClip: No animation in JSONLoader data.');
			return null;

		}

		const addNonemptyTrack = function (
			trackType: new (name: string, times: number[], values: number[]) => KeyframeTrack,
			trackName: string,
			animationKeys: JSONKeyframe[],
			propertyName: string,
			destTracks: KeyframeTrack[]
		) {

			// only return track if there are actually keys.
			if (animationKeys.length !== 0) {

				const times: number[] = [];
				const values: number[] = [];

				AnimationUtils.flattenJSON(animationKeys, times, values, propertyName);

				// empty keys are filtered out, so check again
				if (times.length !== 0) {

					destTracks.push(new trackType(trackName, times, values));

				}

			}

		};

		const tracks = [];

		const clipName = animation.name || 'default';
		const fps = animation.fps || 30;
		const blendMode = animation.blendMode;

		// automatic length determination in AnimationClip.
		let duration = animation.length || - 1;

		const hierarchyTracks = animation.hierarchy || [];

		for (let h = 0; h < hierarchyTracks.length; h++) {

			const animationKeys = hierarchyTracks[h].keys;

			// skip empty tracks
			if (!animationKeys || animationKeys.length === 0) continue;

			// process morph targets
			if (animationKeys[0].morphTargets) {

				// figure out all morph targets used in this track
				const morphTargetNames: Record<string, number> = {};

				let k;

				for (k = 0; k < animationKeys.length; k++) {

					const morphTargets = animationKeys[k].morphTargets;

					// if (animationKeys[k].morphTargets) {
					if (morphTargets) {

						// for (let m = 0; m < animationKeys[k].morphTargets.length; m++) {
						for (let m = 0; m < morphTargets.length; m++) {


							// morphTargetNames[animationKeys[k].morphTargets[m]] = - 1;
							morphTargetNames[morphTargets[m]] = - 1;

						}

					}

				}

				// create a track for each morph target with all zero
				// morphTargetInfluences except for the keys in which
				// the morphTarget is named.
				for (const morphTargetName in morphTargetNames) {

					const times: number[] = [];
					const values: number[] = [];

					const morphTargets = animationKeys[k].morphTargets;
					if (!morphTargets) continue; // skip if undefined

					// for (let m = 0; m !== animationKeys[k].morphTargets.length; ++m) {
					for (let m = 0; m < morphTargets.length; ++m) {

						const animationKey = animationKeys[k];

						times.push(animationKey.time);
						values.push((animationKey.morphTarget === morphTargetName) ? 1 : 0);

					}

					tracks.push(new NumberKeyframeTrack('.morphTargetInfluence[' + morphTargetName + ']', times, values));

				}

				duration = morphTargetNames.length * fps;

			} else {

				// ...assume skeletal animation

				const boneName = '.bones[' + bones[h].name + ']';

				addNonemptyTrack(
					VectorKeyframeTrack, boneName + '.position',
					animationKeys, 'pos', tracks);

				addNonemptyTrack(
					QuaternionKeyframeTrack, boneName + '.quaternion',
					animationKeys, 'rot', tracks);

				addNonemptyTrack(
					VectorKeyframeTrack, boneName + '.scale',
					animationKeys, 'scl', tracks);

			}

		}

		if (tracks.length === 0) {

			return null;

		}

		const clip = new this(clipName, duration, tracks, blendMode);

		return clip;

	}

	/**
	 * Sets the duration of this clip to the duration of its longest keyframe track.
	 *
	 * @return {AnimationClip} A reference to this animation clip.
	 */
	public resetDuration(): this {

		const tracks = this.tracks;
		let duration = 0;

		for (let i = 0, n = tracks.length; i !== n; ++i) {

			const track = this.tracks[i];

			duration = Math.max(duration, track.times[track.times.length - 1]);

		}

		this.duration = duration;

		return this;

	}

	/**
	 * Trims all tracks to the clip's duration.
	 *
	 * @return {AnimationClip} A reference to this animation clip.
	 */
	public trim(): this {

		for (let i = 0; i < this.tracks.length; i++) {

			this.tracks[i].trim(0, this.duration);

		}

		return this;

	}

	/**
	 * Performs minimal validation on each track in the clip. Returns `true` if all
	 * tracks are valid.
	 *
	 * @return {boolean} Whether the clip's keyframes are valid or not.
	 */
	public validate(): boolean {

		let valid = true;

		for (let i = 0; i < this.tracks.length; i++) {

			valid = valid && this.tracks[i].validate();

		}

		return valid;

	}

	/**
	 * Optimizes each track by removing equivalent sequential keys (which are
	 * common in morph target sequences).
	 *
	 * @return {AnimationClip} A reference to this animation clip.
	 */
	public optimize(): this {

		for (let i = 0; i < this.tracks.length; i++) {

			this.tracks[i].optimize();

		}

		return this;

	}

	/**
	 * Returns a new animation clip with copied values from this instance.
	 *
	 * @return {AnimationClip} A clone of this instance.
	 */
	public clone(): AnimationClip {

		const tracks = [];

		for (let i = 0; i < this.tracks.length; i++) {

			tracks.push(this.tracks[i].clone());

		}

		const ctor = this.constructor as {
			new(name: string, duration: number, tracks: any[], blendMode?: number): AnimationClip
		};

		// const clip = new this.constructor(this.name, this.duration, tracks, this.blendMode);
		const clip = new ctor(this.name, this.duration, tracks, this.blendMode);

		clip.userData = JSON.parse(JSON.stringify(this.userData));

		return clip;

	}

	/**
	 * Serializes this animation clip into JSON.
	 *
	 * @return {Object} The JSON object.
	 */
	public toJSON(): any {

		const ctor = this.constructor as typeof AnimationClip;

		// return this.constructor.toJSON(this);
		return ctor.toJSON(this);

	}

}

function getTrackTypeForValueTypeName(typeName: string) {

	switch (typeName.toLowerCase()) {

		case 'scalar':
		case 'double':
		case 'float':
		case 'number':
		case 'integer':

			return NumberKeyframeTrack;

		case 'vector':
		case 'vector2':
		case 'vector3':
		case 'vector4':

			return VectorKeyframeTrack;

		case 'color':

			return ColorKeyframeTrack;

		case 'quaternion':

			return QuaternionKeyframeTrack;

		case 'bool':
		case 'boolean':

			return BooleanKeyframeTrack;

		case 'string':

			return StringKeyframeTrack;

	}

	throw new Error('KeyframeTrack: Unsupported typeName: ' + typeName);

}

function parseKeyframeTrack(json: any) {

	if (json.type === undefined) {

		throw new Error('KeyframeTrack: track type undefined, can not parse');

	}

	const trackType = getTrackTypeForValueTypeName(json.type);

	if (json.times === undefined) {

		const times: number[] = [], values: number[] = [];

		AnimationUtils.flattenJSON(json.keys, times, values, 'value');

		json.times = times;
		json.values = values;

	}

	// derived classes can define a static parse method
	if ((trackType as any).parse !== undefined) {

		return (trackType as any).parse(json);

	} else {

		// by default, we assume a constructor compatible with the base
		return new trackType(json.name, json.times, json.values, json.interpolation);

	}

}
