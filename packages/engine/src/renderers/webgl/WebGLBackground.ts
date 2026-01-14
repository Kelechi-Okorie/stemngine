import { BackSide, FrontSide, CubeUVReflectionMapping, SRGBTransfer } from '../../constants.js';
import { BoxGeometry } from '../../geometries/BoxGeometry.js';
import { PlaneGeometry } from '../../geometries/PlaneGeometry.js';
import { ShaderMaterial } from '../../materials/ShaderMaterial.js';
import { Color } from '../../math/Color.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { Euler } from '../../math/Euler.js';
import { Matrix4 } from '../../math/Matrix4.js';
import { Mesh } from '../../objects/Mesh.js';
import { ShaderLib } from '../shaders/ShaderLib.js';
import { cloneUniforms, getUnlitUniformColorSpace } from '../shaders/UniformsUtils.js';
import { WebGLRenderer } from '../WebGLRenderer.js';
import { WebGLCubeMaps } from './WebGLCubeMaps.js';
import { WebGLCubeUVMaps } from './WebGLCubeUVMaps.js';
import { WebGLObjects } from './WebGLObjects.js';
import { WebGLState } from './WebGLState.js';
import { Scene } from '../../scenes/Scene.js';
import { WebGLRenderList } from './WebGLRenderLists.js';
import { isCubeTexture } from '../../textures/CubeTexture.js';
import { Texture } from '../../textures/Texture.js';

const _rgb = { r: 0, b: 0, g: 0 };
const _e1 = /*@__PURE__*/ new Euler();
const _m1 = /*@__PURE__*/ new Matrix4();

export class WebGLBackground {
  public clearColor = new Color(0x000000);
  public clearAlpha: number;

  public planeMesh: Mesh | null = null;
  public boxMesh: Mesh | null = null;

  public currentBackground: Color | Texture | null = null;
  public currentBackgroundVersion: number = 0;
  public currentTonemapping: number | null = null;

  public renderer: WebGLRenderer;
  public cubemaps: ReturnType<typeof WebGLCubeMaps>;
  public cubeuvmaps: ReturnType<typeof WebGLCubeUVMaps>;
  public state: ReturnType<typeof WebGLState>;
  public objects: ReturnType<typeof WebGLObjects>;
  public alpha: boolean;
  public premultipliedAlpha: boolean;

  public cm = ColorManagement.instance;

  constructor(
    renderer: WebGLRenderer,
    cubemaps: ReturnType<typeof WebGLCubeMaps>,
    cubeuvmaps: ReturnType<typeof WebGLCubeUVMaps>,
    state: ReturnType<typeof WebGLState>,
    objects: ReturnType<typeof WebGLObjects>,
    alpha: boolean,
    premultipliedAlpha: boolean
  ) {
    this.renderer = renderer;
    this.cubemaps = cubemaps;
    this.cubeuvmaps = cubeuvmaps;
    this.state = state;
    this.objects = objects;
    this.alpha = alpha;
    this.premultipliedAlpha = premultipliedAlpha;
    this.clearAlpha = alpha === true ? 0 : 1;

  }


  private getBackground(scene: Scene) {

    let background = scene.isScene === true ? scene.background : null;

    if (background && 'isTexture' in background) {

      const usePMREM = scene.backgroundBlurriness > 0; // use PMREM if the user wants to blur the background
      background = (usePMREM ? this.cubeuvmaps : this.cubemaps).get(background);

    }

    return background;

  }

  public render(scene: Scene) {

    let forceClear = false;
    const background = this.getBackground(scene);

    if (background === null) {

      this.setClear(this.clearColor, this.clearAlpha);

    } else if (background && 'isColor' in background) {

      this.setClear(background as Color, 1);
      forceClear = true;

    }

    // TODO: implement webxr
    // const environmentBlendMode = this.renderer.xr.getEnvironmentBlendMode();

    // if (environmentBlendMode === 'additive') {

    //   this.state.buffers.color.setClear(0, 0, 0, 1, this.premultipliedAlpha);

    // } else if (environmentBlendMode === 'alpha-blend') {

    //   this.state.buffers.color.setClear(0, 0, 0, 0, this.premultipliedAlpha);

    // }

    if (this.renderer.autoClear || forceClear) {

      // buffers might not be writable which is required to ensure a correct clear

      this.state.buffers.depth.setTest(true);
      this.state.buffers.depth.setMask(true);
      this.state.buffers.color.setMask(true);

      this.renderer.clear(this.renderer.autoClearColor, this.renderer.autoClearDepth, this.renderer.autoClearStencil);

    }

  }

  public setClear(color: Color, alpha: number) {

    // color.getRGB(_rgb, getUnlitUniformColorSpace(this.renderer));
    color.getRGB(/* _rgb */ new Color(_rgb.r, _rgb.g, _rgb.b), getUnlitUniformColorSpace(this.renderer));

    this.state.buffers.color.setClear(_rgb.r, _rgb.g, _rgb.b, alpha, this.premultipliedAlpha);

  }

  public setClearColor(color: number, alpha = 1) {

    this.clearColor.set(color);
    this.clearAlpha = alpha;
    this.setClear(this.clearColor, this.clearAlpha);

  }
  public getClearAlpha() {

    return this.clearAlpha;

  }
  public setClearAlpha(alpha: number) {

    this.clearAlpha = alpha;
    this.setClear(this.clearColor, this.clearAlpha);

  }

  public dispose() {

    if (this.boxMesh !== null) {

      this.boxMesh.geometry.dispose();

      if ('isMaterial' in this.boxMesh.material) {
        this.boxMesh.material.dispose();
      }

      this.boxMesh = null;

    }

    if (this.planeMesh !== null) {

      this.planeMesh.geometry.dispose();

      if ('isMaterial' in this.planeMesh.material) {
        this.planeMesh.material.dispose();
      }

      this.planeMesh = null;

    }

  }

  public addToRenderList(
    renderList: ReturnType<typeof WebGLRenderList>,
    scene: Scene
  ) {

    const background = this.getBackground(scene);

    // if (background && ('isCubeTexture' in background || background.mapping === CubeUVReflectionMapping)) {
    if (background && (isCubeTexture(background as Texture))){

      if (this.boxMesh === null) {

        this.boxMesh = new Mesh(
          new BoxGeometry(1, 1, 1),
          new ShaderMaterial({
            name: 'BackgroundCubeMaterial',
            uniforms: cloneUniforms(ShaderLib.backgroundCube.uniforms),
            vertexShader: ShaderLib.backgroundCube.vertexShader,
            fragmentShader: ShaderLib.backgroundCube.fragmentShader,
            side: BackSide,
            depthTest: false,
            depthWrite: false,
            fog: false,
            allowOverride: false
          })
        );

        this.boxMesh.geometry.deleteAttribute('normal');
        this.boxMesh.geometry.deleteAttribute('uv');

        this.boxMesh.onBeforeRender = function (renderer, scene, camera) {

          this.matrixWorld.copyPosition(camera.matrixWorld);

        };

        // add "envMap" material property so the renderer can evaluate it like for built-in materials
        Object.defineProperty(this.boxMesh.material, 'envMap', {

          get: function () {

            return this.uniforms.envMap.value;

          }

        });

        this.objects.update(this.boxMesh);

      }

      _e1.copy(scene.backgroundRotation);

      // accommodate left-handed frame
      _e1.x *= - 1; _e1.y *= - 1; _e1.z *= - 1;

      if (background && 'isCubeTexture' in background && background.isRenderTargetTexture === false) {

        // environment maps which are not cube render targets or PMREMs follow a different convention
        _e1.y *= - 1;
        _e1.z *= - 1;

      }

      // TODO: confirm this works. this.boxMesh.materail were replaced by material
      const material = this.boxMesh.material as ShaderMaterial;

      material.uniforms.envMap.value = background;
      material.uniforms.flipEnvMap.value = ( background && 'isCubeTexture' in background && background.isRenderTargetTexture === false) ? - 1 : 1;
      material.uniforms.backgroundBlurriness.value = scene.backgroundBlurriness;
      material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
      material.uniforms.backgroundRotation.value.setFromMatrix4(_m1.makeRotationFromEuler(_e1));

      if ( background && 'colorSpace' in background) {
        material.toneMapped = this.cm.getTransfer(background.colorSpace) !== SRGBTransfer;
      }

      if ('isTexture' in background && (this.currentBackground !== background ||
        this.currentBackgroundVersion !== background.version ||
        this.currentTonemapping !== this.renderer.toneMapping)) {

        material.needsUpdate = true;

        this.currentBackground = background;
        if (background !== null && 'version' in background) {
          this.currentBackgroundVersion = background.version;
        }
        this.currentTonemapping = this.renderer.toneMapping;

      }

      if (this.boxMesh !== null) {
        this.boxMesh.layers.enableAll();
      }

      // push to the pre-sorted opaque render list
      renderList.unshift(this.boxMesh, this.boxMesh.geometry, material, 0, 0, null);

    } else if (background && 'isTexture' in background) {

      if (this.planeMesh === null) {

        this.planeMesh = new Mesh(
          new PlaneGeometry(2, 2),
          new ShaderMaterial({
            name: 'BackgroundMaterial',
            uniforms: cloneUniforms(ShaderLib.background.uniforms),
            vertexShader: ShaderLib.background.vertexShader,
            fragmentShader: ShaderLib.background.fragmentShader,
            side: FrontSide,
            depthTest: false,
            depthWrite: false,
            fog: false,
            allowOverride: false
          })
        );

        this.planeMesh.geometry.deleteAttribute('normal');

        // add "map" material property so the renderer can evaluate it like for built-in materials
        Object.defineProperty(this.planeMesh.material, 'map', {

          get: function () {

            return this.uniforms.t2D.value;

          }

        });

        this.objects.update(this.planeMesh);

      }

      // TODO: confirm this works - this.planeMesh.material replaced with material
      const material = this.planeMesh.material as ShaderMaterial;

      // this.planeMesh.material.uniforms.t2D.value = background;
      // this.planeMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
      // this.planeMesh.material.toneMapped = this.cm.getTransfer(background.colorSpace) !== SRGBTransfer;
      material.uniforms.t2D.value = background;
      material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
      material.toneMapped = this.cm.getTransfer(background.colorSpace) !== SRGBTransfer;

      if ('matrixAutoUpdate' in background === true) {

        background.updateMatrix();

      }

      material.uniforms.uvTransform.value.copy(background.matrix);

      if (this.currentBackground !== background ||
        this.currentBackgroundVersion !== background.version ||
        this.currentTonemapping !== this.renderer.toneMapping) {

        material.needsUpdate = true;

        this.currentBackground = background;
        this.currentBackgroundVersion = background.version;
        this.currentTonemapping = this.renderer.toneMapping;

      }

      this.planeMesh.layers.enableAll();

      // push to the pre-sorted opaque render list
      renderList.unshift(this.planeMesh, this.planeMesh.geometry, material, 0, 0, null);

    }

  }


}
