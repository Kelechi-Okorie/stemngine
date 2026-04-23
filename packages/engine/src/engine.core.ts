import { REVISION } from "./constants";

// constants.ts
export { HalfFloatType, NoBlending, AdditiveBlending, DoubleSide, RGBADepthPacking } from './constants';

// animation
export { AnimationClip } from './animation/AnimationClip';

// cameras
export { ArrayCamera } from './cameras/ArrayCamera';
export { CubeCamera } from './cameras/CubeCamera';
export { Camera } from './cameras/Camera';
export { OrthographicCamera, isOrthographicCamera } from './cameras/OrthographicCamera';
export { PerspectiveCamera, isPerspectiveCamera } from './cameras/PerspectiveCamera';

// controls
export { OrbitControls } from './controllers/OrbitControls';
export { InputOrbitMapper } from './controllers/InputOrbitMapper';

// core
export { BufferAttribute } from './core/BufferAttribute';
export { Float32BufferAttribute } from './core/BufferAttribute';
export { BufferGeometry } from './core/BufferGeometry';
export { Clock } from './core/Clock';
export { EventDispatcher } from './core/EventDispatcher';
export { GLBufferAttribute } from './core/GLBufferAttribute';
export { InstancedBufferAttribute } from './core/InstancedBufferAttribute';
export { InstancedBufferGeometry } from './core/InstancedBufferGeometry';
export { InstancedInterleavedBuffer } from './core/InstancedInterleaveBuffer';
export { InterleavedBuffer } from './core/InterleavedBuffer';
export { InterleavedBufferAttribute } from './core/InterleavedBufferAttribute';
export { Layers } from './core/Layers';
export { Node3D } from './core/Node3D';
export { Raycaster } from './core/Raycaster';
export { RenderTarget } from './core/RenderTarget';
export { RenderTarget3D } from './core/RenderTarget3D';
export { Uniform } from './core/Uniform';
export { UniformsGroup } from './core/UniformsGroup';

// extras

// geometries
export { BoxGeometry } from './geometries/BoxGeometry';
export { CylinderGeometry } from './geometries/CylinderGeometry';
export { PlaneGeometry } from './geometries/PlaneGeometry';
export { SphereGeometry } from './geometries/SphereGeometry';

// helpers
export { BoxHelper } from './helpers/BoxHelper';

// inputs
// export { InputManager } from './inputs/InputManager';
export { BrowserInputManager } from './inputs/BrowserInputManager';

// lights
export { AmbientLight } from './lights/AmbientLight';
export { DirectionalLight } from './lights/DirectionalLight';
export { DirectionalLightShadow } from './lights/DirectionalLightShadow';
export { HemisphereLight } from './lights/HemisphereLght';
export { Light } from './lights/Light';
export { LightProbe } from './lights/LightProbe';
export { LightShadow } from './lights/LightShadow';
export { PointLight } from './lights/PointLight';
export { PointLightShadow } from './lights/PointLightShadow';
export { RectAreaLight } from './lights/RectAreaLight';
export { SpotLight } from './lights/SpotLight';
export { SpotLightShadow } from './lights/SpotLightShadow';

// materials
export { LineBasicMaterial } from './materials/LineBasicMaterial';
export { LineDashedMaterial } from './materials/LineDashedMaterial';
export { Material } from './materials/Material';
export { MeshBasicMaterial } from './materials/MeshBasicMaterial';
export { MeshDepthMaterial } from './materials/MeshDepthMaterial';
export { MeshDistanceMaterial } from './materials/MeshDistanceMaterial';
export { MeshLambertMaterial } from './materials/MeshLambertMaterial';
export { MeshNormalMaterial } from './materials/MeshNormalMaterial';
export { MeshPhongMaterial } from './materials/MeshPhongMaterial';
export { MeshStandardMaterial } from './materials/MeshStandardMaterial';
export { PointsMaterial } from './materials/PointsMaterial';
export { RawShaderMaterial } from './materials/RawShaderMaterial';
export { ShaderMaterial } from './materials/ShaderMaterial';
export { SpriteMaterial } from './materials/SpriteMaterial';

// math
export { Box3 } from './math/Box3';
export { Color } from './math/Color';
export { ColorManagement } from './math/ColorManagement';
export { Cylindrical } from './math/Cylindrical';
export { Euler } from './math/Euler';
export { Frustum } from './math/Frustum';
export { FrustumArray } from './math/FrustumArray';
export { Line3 } from './math/Line3';
// export { mathUtils}
export { Matrix2 } from './math/Matrix2';
export { Matrix3 } from './math/Matrix3';
export { Matrix4 } from './math/Matrix4';
export { Plane } from './math/Plane';
export { Quaternion } from './math/Quaternion';
export { Ray } from './math/Ray';
export { Sphere } from './math/Sphere';
export { Spherical } from './math/Spherical';
export { SphericalHarmonics3 } from './math/SphericalHarmonics3';
export { Triangle } from './math/Triangle';
export { Vector2 } from './math/Vector2';
export { Vector3 } from './math/Vector3';
export { Vector4 } from './math/Vector4';

// objects
export { BatchedMesh } from './objects/BatchedMesh';
export { Group } from './objects/Group';
export { InstancedMesh } from './objects/InstancedMesh';
export { Mesh } from './objects/Mesh';
export { Sprite } from './objects/Sprite';

// renderers
export { WebGL3DRenderTarget } from './renderers/WebGL3DRenderTarget';
export { WebGLArrayRenderTarget } from './renderers/WebGLArrayRenderTarget';
export { WebGLCubeRenderTarget } from './renderers/WebGLCubeRenderTarget';
export { WebGLRenderTarget } from './renderers/WebGLRenderTarget';

export { cloneUniforms } from './renderers/shaders/UniformsUtils'

// scenes
export { Fog } from './scenes/Fog';
export { FogExp2 } from './scenes/FogExp2';
export { Scene } from './scenes/Scene';

// utils
export { createCanvasElement } from './utils';

// Simulations
export { SimPropertyBinding } from './simulations/core/SimPropertyBinding';
export { SimBindingManager } from './simulations/core/SimBindingManager';
export { Simulation } from './simulations/Simulation';
export { World } from './simulations/World';

export { ParticleSystem } from './simulations/domains/physics/ParticleSystem';

// textures
export { CanvasTexture } from './textures/CanvasTexture';
export { CompressedArrayTexture } from './textures/CompressedArrayTexture';
export { CompressedCubeTexture } from './textures/CompressedCubeTexture';
export { CompressedTexture } from './textures/CompressedTexture';
export { CubeTexture } from './textures/CubeTexture';
export { Data3DTexture } from './textures/Data3DTexture';
export { DataArrayTexture } from './textures/DataArrayTexture';
export { DataTexture } from './textures/DataTexture';
export { DepthTexture } from './textures/DepthTexture';
export { ExternalTexture } from './textures/ExternalTexture';
export { Source } from './textures/Source';
export { Texture } from './textures/Texture';
export { VideoTexture } from './textures/VideoTexture';

//////////////////////////////
// visualizations
/////////////////////////////
/**
 * chart
 */
// interfaces
export type { DataSourceOptions, RenderContext } from './visualizations/chart/Interfaces';
export { DataSourceTypes } from './visualizations/chart/Interfaces';
export type { PointAttribute } from './visualizations/chart/Interfaces';
export { PlotType } from './visualizations/chart/Interfaces';
export type { SeriesOptions } from './visualizations/chart/core/Series';
export { Chart } from './visualizations/chart/Chart';

// core
export { Axes } from './visualizations/chart/core/Axes';
export { GridLayout } from './visualizations/chart/core/GridLayout';
export { Plot } from './visualizations/chart/core/Plot';
export { PlotArea } from './visualizations/chart/core/PlotArea';
export { Series } from './visualizations/chart/core/Series';
export { TransformPipeline } from './visualizations/chart/core/TransformPipeline';

// extras
export { aosToBuffer } from './visualizations/chart/extras/DataAdapter';
export { bufferToAOS } from './visualizations/chart/extras/DataAdapter';

// plotters
export { BarPlotter } from './visualizations/chart/plotters/BarPlotter';
export { LinePlotter } from './visualizations/chart/plotters/LinePlotter';
export { PointPlotter } from './visualizations/chart/plotters/PointPlotter';

// sources
export { StaticArraySource } from './visualizations/chart/sources/StaticArraySource';
export { StreamingSource } from './visualizations/chart/sources/StreamingSource';
