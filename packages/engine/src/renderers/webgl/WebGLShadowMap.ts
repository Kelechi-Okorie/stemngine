import { FrontSide, BackSide, DoubleSide, NearestFilter, PCFShadowMap, VSMShadowMap, RGBADepthPacking, NoBlending } from '../../constants';
import { WebGLRenderTarget } from '../WebGLRenderTarget';
import { MeshDepthMaterial } from '../../materials/MeshDepthMaterial';
import { MeshDistanceMaterial } from '../../materials/MeshDistanceMaterial';
import { ShaderMaterial } from '../../materials/ShaderMaterial';
import { BufferAttribute } from '../../core/BufferAttribute';
import { BufferGeometry } from '../../core/BufferGeometry';
import { Mesh } from '../../objects/Mesh';
import { Vector4 } from '../../math/Vector4';
import { Vector2 } from '../../math/Vector2';
import { Frustum } from '../../math/Frustum';
import { Light } from '../../lights/Light';

import * as vsm from '../shaders/ShaderLib/vsm.glsl';
import { WebGLRenderer } from '../WebGLRenderer';
import { WebGLObjects } from './WebGLObjects';
import { WebGLCapabilities } from './WebGLCapabilities';
import { Scene } from '../../scenes/Scene';
import { Camera } from '../../cameras/Camera';
import { LightShadow } from '../../lights/LightShadow';
import { WebGLMaterials } from './WebGLMaterials';
import { BaseEvent } from '../../core/EventDispatcher';

export class WebGLShadowMap {

  public _frustum = new Frustum();

  public _shadowMapSize = new Vector2();
  public _viewportSize = new Vector2();

  public _viewport = new Vector4();

  public _depthMaterial = new MeshDepthMaterial({ depthPacking: RGBADepthPacking });
  public _distanceMaterial = new MeshDistanceMaterial();

  public _materialCache: any = {};

  public _maxTextureSize: any;

  public shadowSide = { [FrontSide]: BackSide, [BackSide]: FrontSide, [DoubleSide]: DoubleSide };

  public shadowMaterialVertical = new ShaderMaterial({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new Vector2() },
      radius: { value: 4.0 }
    },

    vertexShader: vsm.vertex,
    fragmentShader: vsm.fragment

  });

  public shadowMaterialHorizontal = this.shadowMaterialVertical.clone();

  public fullScreenTri = new BufferGeometry();

  public fullScreenMesh = new Mesh(this.fullScreenTri, this.shadowMaterialVertical);

  public scope = this;

  public enabled = false;

  public autoUpdate = true;
  public needsUpdate = false;

  public type = PCFShadowMap;
  public _previousType = this.type;

  public renderer: WebGLRenderer;
  public objects: WebGLObjects;

  constructor(
    renderer: WebGLRenderer,
    objects: WebGLObjects,
    capabilities: WebGLCapabilities
  ) {
    this.renderer = renderer;
    this.objects = objects;
    this._maxTextureSize = capabilities.maxTextureSize;
    this.shadowMaterialHorizontal.defines.HORIZONTAL_PASS = 1;

    this.fullScreenTri.setAttribute(
      'position',
      new BufferAttribute(
        new Float32Array([- 1, - 1, 0.5, 3, - 1, 0.5, - 1, 3, 0.5]),
        3
      )
    );


  }

  public render(
    lights: Light[],
    scene: Scene,
    camera: Camera
  ) {

    if (this.enabled === false) return;
    if (this.autoUpdate === false && this.needsUpdate === false) return;

    if (lights.length === 0) return;

    const currentRenderTarget = this.renderer.getRenderTarget();
    const activeCubeFace = this.renderer.getActiveCubeFace();
    const activeMipmapLevel = this.renderer.getActiveMipmapLevel();

    const _state = this.renderer.state;

    // Set GL state for depth map.
    _state.setBlending(NoBlending);

    if (_state.buffers.depth.getReversed() === true) {

      _state.buffers.color.setClear(0, 0, 0, 0);

    } else {

      _state.buffers.color.setClear(1, 1, 1, 1);

    }

    _state.buffers.depth.setTest(true);
    _state.setScissorTest(false);

    // check for shadow map type changes

    const toVSM = (this._previousType !== VSMShadowMap && this.type === VSMShadowMap);
    const fromVSM = (this._previousType === VSMShadowMap && this.type !== VSMShadowMap);

    // render depth map

    for (let i = 0, il = lights.length; i < il; i++) {

      const light = lights[i];
      const shadow = light.shadow;

      if (shadow === undefined) {

        console.warn('WebGLShadowMap:', light, 'has no shadow.');
        continue;

      }

      if (shadow.autoUpdate === false && shadow.needsUpdate === false) continue;

      this._shadowMapSize.copy(shadow.mapSize);

      const shadowFrameExtents = shadow.getFrameExtents();

      this._shadowMapSize.multiply(shadowFrameExtents);

      this._viewportSize.copy(shadow.mapSize);

      if (this._shadowMapSize.x > this._maxTextureSize || this._shadowMapSize.y > this._maxTextureSize) {

        if (this._shadowMapSize.x > this._maxTextureSize) {

          this._viewportSize.x = Math.floor(this._maxTextureSize / shadowFrameExtents.x);
          this._shadowMapSize.x = this._viewportSize.x * shadowFrameExtents.x;
          shadow.mapSize.x = this._viewportSize.x;

        }

        if (this._shadowMapSize.y > this._maxTextureSize) {

          this._viewportSize.y = Math.floor(this._maxTextureSize / shadowFrameExtents.y);
          this._shadowMapSize.y = this._viewportSize.y * shadowFrameExtents.y;
          shadow.mapSize.y = this._viewportSize.y;

        }

      }

      if (shadow.map === null || toVSM === true || fromVSM === true) {

        const pars = (this.type !== VSMShadowMap) ? { minFilter: NearestFilter, magFilter: NearestFilter } : {};

        if (shadow.map !== null) {

          shadow.map.dispose();

        }

        shadow.map = new WebGLRenderTarget(this._shadowMapSize.x, this._shadowMapSize.y, pars);
        shadow.map.texture.name = light.name + '.shadowMap';

        shadow.camera.updateProjectionMatrix();

      }

      this.renderer.setRenderTarget(shadow.map);
      this.renderer.clear();

      const viewportCount = shadow.getViewportCount();

      for (let vp = 0; vp < viewportCount; vp++) {

        const viewport = shadow.getViewport(vp);

        this._viewport.set(
          this._viewportSize.x * viewport.x,
          this._viewportSize.y * viewport.y,
          this._viewportSize.x * viewport.z,
          this._viewportSize.y * viewport.w
        );

        _state.viewport(this._viewport);

        shadow.updateMatrices(light/* , vp */);

        this._frustum = shadow.getFrustum();

        this.renderObject(scene, camera, shadow.camera, light, this.type);

      }

      // do blur pass for VSM

      if ('isPointLightShadow' in shadow !== true && this.type === VSMShadowMap) {

        this.VSMPass(shadow, camera);

      }

      shadow.needsUpdate = false;

    }

    this._previousType = this.type;

    this.scope.needsUpdate = false;

    this.renderer.setRenderTarget(currentRenderTarget, activeCubeFace, activeMipmapLevel);

  };

  public VSMPass(
    shadow: LightShadow,
    camera: Camera
  ) {

    const geometry = this.objects.update(this.fullScreenMesh);

    if (this.shadowMaterialVertical.defines.VSM_SAMPLES !== shadow.blurSamples) {

      this.shadowMaterialVertical.defines.VSM_SAMPLES = shadow.blurSamples;
      this.shadowMaterialHorizontal.defines.VSM_SAMPLES = shadow.blurSamples;

      this.shadowMaterialVertical.needsUpdate = true;
      this.shadowMaterialHorizontal.needsUpdate = true;

    }

    if (shadow.mapPass === null) {

      shadow.mapPass = new WebGLRenderTarget(this._shadowMapSize.x, this._shadowMapSize.y);

    }

    // vertical pass

    if (shadow.map !== null) {
      this.shadowMaterialVertical.uniforms.shadow_pass.value = shadow.map.texture;
    }
    this.shadowMaterialVertical.uniforms.resolution.value = shadow.mapSize;
    this.shadowMaterialVertical.uniforms.radius.value = shadow.radius;
    this.renderer.setRenderTarget(shadow.mapPass);
    this.renderer.clear();
    this.renderer.renderBufferDirect(camera, null, geometry, this.shadowMaterialVertical, this.fullScreenMesh, null);

    // horizontal pass

    this.shadowMaterialHorizontal.uniforms.shadow_pass.value = shadow.mapPass.texture;
    this.shadowMaterialHorizontal.uniforms.resolution.value = shadow.mapSize;
    this.shadowMaterialHorizontal.uniforms.radius.value = shadow.radius;
    this.renderer.setRenderTarget(shadow.map);
    this.renderer.clear();
    this.renderer.renderBufferDirect(camera, null, geometry, this.shadowMaterialHorizontal, this.fullScreenMesh, null);

  }

  // TODO: type well
  public getDepthMaterial(
    object: any,
    material: any,
    light: any,
    type: any
  ) {

    let result = null;

    const customMaterial = (light.isPointLight === true) ? object.customDistanceMaterial : object.customDepthMaterial;

    if (customMaterial !== undefined) {

      result = customMaterial;

    } else {

      result = (light.isPointLight === true) ? this._distanceMaterial : this._depthMaterial;

      if ((this.renderer.localClippingEnabled && material.clipShadows === true && Array.isArray(material.clippingPlanes) && material.clippingPlanes.length !== 0) ||
        (material.displacementMap && material.displacementScale !== 0) ||
        (material.alphaMap && material.alphaTest > 0) ||
        (material.map && material.alphaTest > 0) ||
        (material.alphaToCoverage === true)) {

        // in this case we need a unique material instance reflecting the
        // appropriate state

        const keyA = result.uuid, keyB = material.uuid;

        let materialsForVariant = this._materialCache[keyA];

        if (materialsForVariant === undefined) {

          materialsForVariant = {};
          this._materialCache[keyA] = materialsForVariant;

        }

        let cachedMaterial = materialsForVariant[keyB];

        if (cachedMaterial === undefined) {

          cachedMaterial = result.clone();
          materialsForVariant[keyB] = cachedMaterial;
          material.addEventListener('dispose', this.onMaterialDispose);

        }

        result = cachedMaterial;

      }

    }

    result.visible = material.visible;
    result.wireframe = material.wireframe;

    if (type === VSMShadowMap) {

      result.side = (material.shadowSide !== null) ? material.shadowSide : material.side;

    } else {

      result.side = (material.shadowSide !== null) ? material.shadowSide : this.shadowSide[material.side];

    }

    result.alphaMap = material.alphaMap;
    result.alphaTest = (material.alphaToCoverage === true) ? 0.5 : material.alphaTest; // approximate alphaToCoverage by using a fixed alphaTest value
    result.map = material.map;

    result.clipShadows = material.clipShadows;
    result.clippingPlanes = material.clippingPlanes;
    result.clipIntersection = material.clipIntersection;

    result.displacementMap = material.displacementMap;
    result.displacementScale = material.displacementScale;
    result.displacementBias = material.displacementBias;

    result.wireframeLinewidth = material.wireframeLinewidth;
    result.linewidth = material.linewidth;

    if (light.isPointLight === true && result.isMeshDistanceMaterial === true) {

      const materialProperties = this.renderer.properties.get(result);
      materialProperties.light = light;

    }

    return result;

  }

  // TODO: type well
  public renderObject(
    object: any,
    camera: any,
    shadowCamera: any,
    light: any,
    type: any
  ) {

    if (object.visible === false) return;

    const visible = object.layers.test(camera.layers);

    if (visible && (object.isMesh || object.isLine || object.isPoints)) {

      if ((object.castShadow || (object.receiveShadow && type === VSMShadowMap)) && (!object.frustumCulled || this._frustum.intersectsObject(object))) {

        object.modelViewMatrix.multiplyMatrices(shadowCamera.matrixWorldInverse, object.matrixWorld);

        const geometry = this.objects.update(object);
        const material = object.material;

        if (Array.isArray(material)) {

          const groups = geometry.groups;

          for (let k = 0, kl = groups.length; k < kl; k++) {

            const group = groups[k];
            const groupMaterial = material[group.materialIndex!];

            if (groupMaterial && groupMaterial.visible) {

              const depthMaterial = this.getDepthMaterial(object, groupMaterial, light, type);

              object.onBeforeShadow(this.renderer, object, camera, shadowCamera, geometry, depthMaterial, group);

              this.renderer.renderBufferDirect(shadowCamera, null, geometry, depthMaterial, object, group);

              object.onAfterShadow(this.renderer, object, camera, shadowCamera, geometry, depthMaterial, group);

            }

          }

        } else if (material.visible) {

          const depthMaterial = this.getDepthMaterial(object, material, light, type);

          object.onBeforeShadow(this.renderer, object, camera, shadowCamera, geometry, depthMaterial, null);

          this.renderer.renderBufferDirect(shadowCamera, null, geometry, depthMaterial, object, null);

          object.onAfterShadow(this.renderer, object, camera, shadowCamera, geometry, depthMaterial, null);

        }

      }

    }

    const children = object.children;

    for (let i = 0, l = children.length; i < l; i++) {

      this.renderObject(children[i], camera, shadowCamera, light, type);

    }

  }

  public onMaterialDispose(event: BaseEvent) {

    const material = event.target;

    material.removeEventListener('dispose', this.onMaterialDispose);

    // make sure to remove the unique distance/depth materials used for shadow map rendering

    for (const id in this._materialCache) {

      const cache = this._materialCache[id];

      const uuid = event.target.uuid;

      if (uuid in cache) {

        const shadowMaterial = cache[uuid];
        shadowMaterial.dispose();
        delete cache[uuid];

      }

    }

  }

}
