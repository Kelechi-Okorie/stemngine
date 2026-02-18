import { Node3D } from '../core/Node3D.js';
import { Skeleton } from '../objects/Skeleton.js';
import { warn, error } from '../utils.js';
import { AnimationObjectGroup, isAnimationObjectGroup } from './AnimationObjectGroup.js';
import { AnyTypedArray } from '../constants.js';

// Characters [].:/ are reserved for track binding syntax.
const _RESERVED_CHARS_RE = '\\[\\]\\.:\\/';
const _reservedRe = new RegExp('[' + _RESERVED_CHARS_RE + ']', 'g');

// Attempts to allow node names from any language. ES5's `\w` regexp matches
// only latin characters, and the unicode \p{L} is not yet supported. So
// instead, we exclude reserved characters and match everything else.
const _wordChar = '[^' + _RESERVED_CHARS_RE + ']';
const _wordCharOrDot = '[^' + _RESERVED_CHARS_RE.replace('\\.', '') + ']';

// Parent directories, delimited by '/' or ':'. Currently unused, but must
// be matched to parse the rest of the track name.
const _directoryRe = /*@__PURE__*/ /((?:WC+[\/:])*)/.source.replace('WC', _wordChar);

// Target node. May contain word characters (a-zA-Z0-9_) and '.' or '-'.
const _nodeRe = /*@__PURE__*/ /(WCOD+)?/.source.replace('WCOD', _wordCharOrDot);

// Object on target node, and accessor. May not contain reserved
// characters. Accessor may contain any character except closing bracket.
const _objectRe = /*@__PURE__*/ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace('WC', _wordChar);

// Property and accessor. May not contain reserved characters. Accessor may
// contain any non-bracket characters.
const _propertyRe = /*@__PURE__*/ /\.(WC+)(?:\[(.+)\])?/.source.replace('WC', _wordChar);

const _trackRe = new RegExp(''
	+ '^'
	+ _directoryRe
	+ _nodeRe
	+ _objectRe
	+ _propertyRe
	+ '$'
);

const _supportedObjectNames = ['material', 'materials', 'bones', 'map'];

export interface ParsedPathName {
	// directory?: string	// TODO: to be removed
	nodeName: string | number
	objectName: string
	objectIndex: string | number
	propertyName: string
	propertyIndex: string | number
}

export interface BindingLike {
  getValue(buffer: AnyTypedArray, offset: number): void;
  setValue(buffer: AnyTypedArray, offset: number): void;
  bind(): void;
  unbind(): void;
}


/**
 * Represents one track bound to multiple objects
 */
export class Composite {

	public _targetGroup: AnimationObjectGroup;
	public _bindings: PropertyBinding[];

	constructor(
		targetGroup: AnimationObjectGroup,
		path: string,
		optionalParsedPath: ParsedPathName
	) {

		const parsedPath = optionalParsedPath || PropertyBinding.parseTrackName(path);

		this._targetGroup = targetGroup;
		this._bindings = targetGroup.subscribe_(path, parsedPath);

	}

	public getValue(array: AnyTypedArray, offset: number) {

		this.bind(); // bind all binding

		const firstValidIndex = this._targetGroup.nCachedObjects_,
			binding = this._bindings[firstValidIndex];

		// and only call .getValue on the first
		if (binding !== undefined) binding.getValue(array, offset);

	}

	public setValue(array: AnyTypedArray, offset: number) {

		const bindings = this._bindings;

		for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {

			bindings[i].setValue(array, offset);

		}

	}

	public bind() {

		const bindings = this._bindings;

		for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {

			bindings[i].bind();

		}

	}

	public unbind() {

		const bindings = this._bindings;

		for (let i = this._targetGroup.nCachedObjects_, n = bindings.length; i !== n; ++i) {

			bindings[i].unbind();

		}

	}

}

// Note: This class uses a State pattern on a per-method basis:
// 'bind' sets 'this.getValue' / 'setValue' and shadows the
// prototype version of these methods with one that represents
// the bound state. When the property is not found, the methods
// become no-ops.


/**
 * PropertyBinding converts a track’s string path into a fast executable
 * reference that can update a real object property every frame
 * 
 * @remarks
 * - Note that tracks do not animate objects, bindings animate objects
 * - Bindings are what actually touch the scene object
 */
export class PropertyBinding {

	/**
	 * The object path to the animated property.
	 *
	 * @type {string}
	 */
	public path: string;

	/**
	 * An object holding information about the path.
	 *
	 * @type {Object}
	 */
	public parsedPath: ParsedPathName;

	/**
	 * The object owns the animated property.
	 *
	 * @type {?Object}
	 */
	public node: any;

	/**
	 * The root node.
	 *
	 * @type {Node3D|Skeleton}
	 */
	public rootNode: Node3D | Skeleton;

	// initial state of these methods that calls 'bind'
	public getValue = this._getValue_unbound;
	public setValue = this._setValue_unbound;

	// internal resolved properties (private)
	private targetObject!: any;      // object that owns the property
	private propertyName!: string    // property key on the object
	private resolvedProperty!: any   // the property itself (array, Vector3, Quaternion)
	private propertyIndex!: string | number   // index if it's an array element


	// TODO: use exports. modern TS modules prefer exports over class nesting
	// export { Composite }
	public static Composite = Composite;

	public static BindingType = {
		Direct: 0,
		EntireArray: 1,
		ArrayElement: 2,
		HasFromToArray: 3
	} as const;

	public static Versioning = {
		None: 0,
		NeedsUpdate: 1,
		MatrixWorldNeedsUpdate: 2
	} as const;

	// Table-driven polymorphism
	// creates branchless fast dispatch tables
	// O(1) table lookup instead of O(n) branching
	// public static GetterByBindingType: Getter[]
	// public static SetterByBindingTypeAndVersioning: Setter[][];

	static GetterByBindingType = [
		PropertyBinding.prototype._getValue_direct,
		PropertyBinding.prototype._getValue_array,
		PropertyBinding.prototype._getValue_arrayElement,
		PropertyBinding.prototype._getValue_toArray,
	];

	static SetterByBindingTypeAndVersioning = [
		[
			PropertyBinding.prototype._setValue_direct,
			PropertyBinding.prototype._setValue_direct_setNeedsUpdate,
			PropertyBinding.prototype._setValue_direct_setMatrixWorldNeedsUpdate,
		],
		[
			PropertyBinding.prototype._setValue_array,
			PropertyBinding.prototype._setValue_array_setNeedsUpdate,
			PropertyBinding.prototype._setValue_array_setMatrixWorldNeedsUpdate,
		],
		[
			PropertyBinding.prototype._setValue_arrayElement,
			PropertyBinding.prototype._setValue_arrayElement_setNeedsUpdate,
			PropertyBinding.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate,
		],
		[
			PropertyBinding.prototype._setValue_fromArray,
			PropertyBinding.prototype._setValue_fromArray_setNeedsUpdate,
			PropertyBinding.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate,
		]
	];

	/**
	 * Better way of doing the above, instead of using prototypes
	 */
	// static GetterByBindingType: (keyof PropertyBinding)[] = [
	// 	"_getValue_direct",
	// 	"_getValue_array",
	// 	"_getValue_arrayElement",
	// 	"_getValue_toArray"
	// ];

	// const fn = this[PropertyBinding.GetterByBindingType[type]] as Getter;
	// fn.call(this, buffer, offset);



	/**
	 * Constructs a new property binding.
	 *
	 * @param {Object} rootNode - The root node.
	 * @param {string} path - The path.
	 * @param {?Object} [parsedPath] - The parsed path.
	 */
	constructor(
		rootNode: Node3D | Skeleton,
		path: string,
		parsedPath: ParsedPathName
	) {

		/**
		 * The object path to the animated property.
		 *
		 * @type {string}
		 */
		this.path = path;

		/**
		 * An object holding information about the path.
		 *
		 * @type {Object}
		 */
		this.parsedPath = parsedPath || PropertyBinding.parseTrackName(path);

		/**
		 * The object owns the animated property.
		 *
		 * @type {?Object}
		 */
		this.node = PropertyBinding.findNode(rootNode, this.parsedPath.nodeName);

		/**
		 * The root node.
		 *
		 * @type {Object3D|Skeleton}
		 */
		this.rootNode = rootNode;

	}

	/**
	 * Factory method for creating a property binding from the given parameters.
	 *
	 * @static
	 * @param {Object} root - The root node.
	 * @param {string} path - The path.
	 * @param {?Object} [parsedPath] - The parsed path.
	 * @return {PropertyBinding|Composite} The created property binding or composite.
	 */
	public static create(
		root: Node3D | Skeleton | AnimationObjectGroup,
		path: string,
		parsedPath: ParsedPathName
	): PropertyBinding | Composite {

		if (!(root && isAnimationObjectGroup(root))) {

			return new PropertyBinding(root, path, parsedPath);

		} else {

			return new PropertyBinding.Composite(root, path, parsedPath);

		}

	}

	/**
	 * Replaces spaces with underscores and removes unsupported characters from
	 * node names, to ensure compatibility with parseTrackName().
	 *
	 * @param {string} name - Node name to be sanitized.
	 * @return {string} The sanitized node name.
	 */
	public static sanitizeNodeName(name: string): string {

		return name.replace(/\s/g, '_').replace(_reservedRe, '');

	}

	/**
	 * Parses the given track name (an object path to an animated property) and
	 * returns an object with information about the path. Matches strings in the following forms:
	 *
	 * - nodeName.property
	 * - nodeName.property[accessor]
	 * - nodeName.material.property[accessor]
	 * - uuid.property[accessor]
	 * - uuid.objectName[objectIndex].propertyName[propertyIndex]
	 * - parentName/nodeName.property
	 * - parentName/parentName/nodeName.property[index]
	 * - .bone[Armature.DEF_cog].position
	 * - scene:helium_balloon_model:helium_balloon_model.position
	 *
	 * @static
	 * @param {string} trackName - The track name to parse.
	 * @return {Object} The parsed track name as an object.
	 */
	public static parseTrackName(trackName: string): ParsedPathName {

		const matches = _trackRe.exec(trackName);

		if (matches === null) {

			throw new Error('PropertyBinding: Cannot parse trackName: ' + trackName);

		}

		const results = {
			// directoryName: matches[ 1 ], // (tschw) currently unused
			nodeName: matches[2],
			objectName: matches[3],
			objectIndex: matches[4],
			propertyName: matches[5], // required
			propertyIndex: matches[6]
		};

		// const lastDot = results.nodeName && results.nodeName.lastIndexOf('.');

		const lastDot = results.nodeName !== undefined ? results.nodeName.lastIndexOf('.') : -1;


		if (lastDot !== undefined && lastDot !== - 1) {

			const objectName = results.nodeName.substring(lastDot + 1);

			// Object names must be checked against an allowlist. Otherwise, there
			// is no way to parse 'foo.bar.baz': 'baz' must be a property, but
			// 'bar' could be the objectName, or part of a nodeName (which can
			// include '.' characters).
			if (_supportedObjectNames.indexOf(objectName) !== - 1) {

				results.nodeName = results.nodeName.substring(0, lastDot);
				results.objectName = objectName;

			}

		}

		if (results.propertyName === null || results.propertyName.length === 0) {

			throw new Error('PropertyBinding: can not parse propertyName from trackName: ' + trackName);

		}

		return results;

	}

	/**
	 * Searches for a node in the hierarchy of the given root object by the given
	 * node name.
	 *
	 * @static
	 * @param {Object} root - The root object.
	 * @param {string|number} nodeName - The name of the node.
	 * @return {?Object} The found node. Returns `null` if no object was found.
	 */
	public static findNode(root: any, nodeName: string | number) {

		if (nodeName === undefined || nodeName === '' || nodeName === '.' || nodeName === - 1 || nodeName === root.name || nodeName === root.uuid) {

			return root;

		}

		// search into skeleton bones.
		if (root.skeleton) {

			const bone = root.skeleton.getBoneByName(nodeName);

			if (bone !== undefined) {

				return bone;

			}

		}

		// search into node subtree.
		if (root.children) {

			const searchNodeSubtree = function (children: Node3D[]): Node3D | null {

				for (let i = 0; i < children.length; i++) {

					const childNode = children[i];

					if (childNode.name === nodeName || childNode.uuid === nodeName) {

						return childNode;

					}

					const result = searchNodeSubtree(childNode.children);

					if (result) return result;

				}

				return null;

			};

			const subTreeNode = searchNodeSubtree(root.children);

			if (subTreeNode) {

				return subTreeNode;

			}

		}

		return null;

	}

	// these are used to "bind" a nonexistent property
	private _getValue_unavailable() { }
	private _setValue_unavailable() { }

	// Getters

	private _getValue_direct(buffer: AnyTypedArray, offset: number) {

		buffer[offset] = this.targetObject[this.propertyName];

	}

	private _getValue_array(buffer: AnyTypedArray, offset: number) {

		const source = this.resolvedProperty;

		for (let i = 0, n = source.length; i !== n; ++i) {

			buffer[offset++] = source[i];

		}

	}

	private _getValue_arrayElement(buffer: AnyTypedArray, offset: number) {

		buffer[offset] = this.resolvedProperty[this.propertyIndex];

	}

	private _getValue_toArray(buffer: AnyTypedArray, offset: number) {

		this.resolvedProperty.toArray(buffer, offset);

	}

	// Direct

	private _setValue_direct(buffer: AnyTypedArray, offset: number) {

		this.targetObject[this.propertyName] = buffer[offset];

	}

	private _setValue_direct_setNeedsUpdate(buffer: AnyTypedArray, offset: number) {

		this.targetObject[this.propertyName] = buffer[offset];
		this.targetObject.needsUpdate = true;

	}

	private _setValue_direct_setMatrixWorldNeedsUpdate(buffer: AnyTypedArray, offset: number) {

		this.targetObject[this.propertyName] = buffer[offset];
		this.targetObject.matrixWorldNeedsUpdate = true;

	}

	// EntireArray

	private _setValue_array(buffer: AnyTypedArray, offset: number) {

		const dest = this.resolvedProperty;

		for (let i = 0, n = dest.length; i !== n; ++i) {

			dest[i] = buffer[offset++];

		}

	}

	private _setValue_array_setNeedsUpdate(buffer: AnyTypedArray, offset: number) {

		const dest = this.resolvedProperty;

		for (let i = 0, n = dest.length; i !== n; ++i) {

			dest[i] = buffer[offset++];

		}

		this.targetObject.needsUpdate = true;

	}

	private _setValue_array_setMatrixWorldNeedsUpdate(buffer: AnyTypedArray, offset: number) {

		const dest = this.resolvedProperty;

		for (let i = 0, n = dest.length; i !== n; ++i) {

			dest[i] = buffer[offset++];

		}

		this.targetObject.matrixWorldNeedsUpdate = true;

	}

	// ArrayElement

	private _setValue_arrayElement(buffer: AnyTypedArray, offset: number) {

		this.resolvedProperty[this.propertyIndex] = buffer[offset];

	}

	private _setValue_arrayElement_setNeedsUpdate(buffer: AnyTypedArray, offset: number) {

		this.resolvedProperty[this.propertyIndex] = buffer[offset];
		this.targetObject.needsUpdate = true;

	}

	private _setValue_arrayElement_setMatrixWorldNeedsUpdate(buffer: AnyTypedArray, offset: number) {

		this.resolvedProperty[this.propertyIndex] = buffer[offset];
		this.targetObject.matrixWorldNeedsUpdate = true;

	}

	// HasToFromArray

	private _setValue_fromArray(buffer: AnyTypedArray, offset: number) {

		this.resolvedProperty.fromArray(buffer, offset);

	}

	private _setValue_fromArray_setNeedsUpdate(buffer: AnyTypedArray, offset: number) {

		this.resolvedProperty.fromArray(buffer, offset);
		this.targetObject.needsUpdate = true;

	}

	private _setValue_fromArray_setMatrixWorldNeedsUpdate(buffer: AnyTypedArray, offset: number) {

		this.resolvedProperty.fromArray(buffer, offset);
		this.targetObject.matrixWorldNeedsUpdate = true;

	}

	private _getValue_unbound(targetArray: AnyTypedArray, offset: number) {

		this.bind();
		this.getValue(targetArray, offset);

	}

	private _setValue_unbound(sourceArray: AnyTypedArray, offset: number) {

		this.bind();
		this.setValue(sourceArray, offset);

	}

	/**
	 * Creates a getter / setter pair for the property tracked by this binding.
	 */
	public bind() {

		let targetObject = this.node;
		const parsedPath = this.parsedPath;

		const objectName = parsedPath.objectName;
		const propertyName = parsedPath.propertyName;
		let propertyIndex = parsedPath.propertyIndex;

		if (!targetObject) {

			targetObject = PropertyBinding.findNode(this.rootNode, parsedPath.nodeName);

			this.node = targetObject;

		}

		// set fail state so we can just 'return' on error
		this.getValue = this._getValue_unavailable;
		this.setValue = this._setValue_unavailable;

		// ensure there is a value node
		if (!targetObject) {

			warn('PropertyBinding: No target node found for track: ' + this.path + '.');
			return;

		}

		if (objectName) {

			let objectIndex = parsedPath.objectIndex;

			// special cases were we need to reach deeper into the hierarchy to get the face materials....
			switch (objectName) {

				case 'materials':

					if (!targetObject.material) {

						error('PropertyBinding: Can not bind to material as node does not have a material.', this);
						return;

					}

					if (!targetObject.material.materials) {

						error('PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.', this);
						return;

					}

					targetObject = targetObject.material.materials;

					break;

				case 'bones':

					if (!targetObject.skeleton) {

						error('PropertyBinding: Can not bind to bones as node does not have a skeleton.', this);
						return;

					}

					// potential future optimization: skip this if propertyIndex is already an integer
					// and convert the integer string to a true integer.

					targetObject = targetObject.skeleton.bones;

					// support resolving morphTarget names into indices.
					for (let i = 0; i < targetObject.length; i++) {

						if (targetObject[i].name === objectIndex) {

							objectIndex = i;
							break;

						}

					}

					break;

				case 'map':

					if ('map' in targetObject) {

						targetObject = targetObject.map;
						break;

					}

					if (!targetObject.material) {

						error('PropertyBinding: Can not bind to material as node does not have a material.', this);
						return;

					}

					if (!targetObject.material.map) {

						error('PropertyBinding: Can not bind to material.map as node.material does not have a map.', this);
						return;

					}

					targetObject = targetObject.material.map;
					break;

				default:

					if (targetObject[objectName] === undefined) {

						error('PropertyBinding: Can not bind to objectName of node undefined.', this);
						return;

					}

					targetObject = targetObject[objectName];

			}


			if (objectIndex !== undefined) {

				if (targetObject[objectIndex] === undefined) {

					error('PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.', this, targetObject);
					return;

				}

				targetObject = targetObject[objectIndex];

			}

		}

		// resolve property
		const nodeProperty = targetObject[propertyName];

		if (nodeProperty === undefined) {

			const nodeName = parsedPath.nodeName;

			error('PropertyBinding: Trying to update property for track: ' + nodeName +
				'.' + propertyName + ' but it wasn\'t found.', targetObject);
			return;

		}

		// determine versioning scheme
		let versioning: number = PropertyBinding.Versioning.None;

		this.targetObject = targetObject;

		if (targetObject.isMaterial === true) {

			versioning = PropertyBinding.Versioning.NeedsUpdate;

		} else if (targetObject.isObject3D === true) {

			versioning = PropertyBinding.Versioning.MatrixWorldNeedsUpdate;

		}

		// determine how the property gets bound
		let bindingType: number = PropertyBinding.BindingType.Direct;

		if (propertyIndex !== undefined) {

			// access a sub element of the property array (only primitives are supported right now)

			if (propertyName === 'morphTargetInfluences') {

				// potential optimization, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

				// support resolving morphTarget names into indices.
				if (!targetObject.geometry) {

					error('PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.', this);
					return;

				}

				if (!targetObject.geometry.morphAttributes) {

					error('PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.', this);
					return;

				}

				if (targetObject.morphTargetDictionary[propertyIndex] !== undefined) {

					propertyIndex = targetObject.morphTargetDictionary[propertyIndex];

				}

			}

			bindingType = PropertyBinding.BindingType.ArrayElement;

			this.resolvedProperty = nodeProperty;
			this.propertyIndex = propertyIndex;

		} else if (nodeProperty.fromArray !== undefined && nodeProperty.toArray !== undefined) {

			// must use copy for Object3D.Euler/Quaternion

			bindingType = PropertyBinding.BindingType.HasFromToArray;

			this.resolvedProperty = nodeProperty;

		} else if (Array.isArray(nodeProperty)) {

			bindingType = PropertyBinding.BindingType.EntireArray;

			this.resolvedProperty = nodeProperty;

		} else {

			this.propertyName = propertyName;

		}

		// select getter / setter
		this.getValue = PropertyBinding.GetterByBindingType[bindingType];
		this.setValue = PropertyBinding.SetterByBindingTypeAndVersioning[bindingType][versioning];

	}

	/**
	 * Unbinds the property.
	 */
	unbind() {

		this.node = null;

		// back to the prototype version of getValue / setValue
		// note: avoiding to mutate the shape of 'this' via 'delete'
		this.getValue = this._getValue_unbound;
		this.setValue = this._setValue_unbound;

	}

}
