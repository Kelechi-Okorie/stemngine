import { Camera } from '../../cameras/Camera';
import { Light } from '../../lights/Light';
import { LightShadow } from '../../lights/LightShadow';
import { WebGLExtensions } from './WebGLExtensions';
import { WebGLLights } from './WebGLLights';
import { Scene } from '../../scenes/Scene';

type WebGLRenderStateType = {
  lightsArray: Light[];
  shadowsArray: Light[];  // Lights that cast shadows
  camera: Camera | null;
  lights: WebGLLights;
  transmissionRenderTarget: Record<string, any>;
};

export class WebGLRenderState {
  private readonly extensions: WebGLExtensions;

  protected lights: WebGLLights;

  protected lightsArray: Light[] = [];
  protected shadowsArray: Light[] = [];

  public state: WebGLRenderStateType;

  constructor(extensions: WebGLExtensions) {
    this.extensions = extensions;
    this.lights = new WebGLLights(extensions);

    this.state  = {
    lightsArray: this.lightsArray,
    shadowsArray: this.shadowsArray,

    camera: null,

    lights: this.lights,

    transmissionRenderTarget: {}
  }
  }


  public init(camera: Camera): void {

    this.state.camera = camera;

    this.lightsArray.length = 0;
    this.shadowsArray.length = 0;

  }

  public pushLight(light: Light): void {

    this.lightsArray.push(light);

  }

  public pushShadow(shadowLight: Light): void {

    this.shadowsArray.push(shadowLight);

  }

  public setupLights() {

    this.lights.setup(this.lightsArray);

  }

  public setupLightsView(camera: Camera) {

    this.lights.setupView(this.lightsArray, camera);

  }

}

export class WebGLRenderStates {
  private readonly extensions: WebGLExtensions;

  protected renderStates = new WeakMap<Scene, WebGLRenderState[]>();

  constructor(extensions: WebGLExtensions) {
    this.extensions = extensions
  }

  public get(scene: Scene, renderCallDepth = 0): WebGLRenderState {

    const renderStateArray = this.renderStates.get(scene);
    let renderState;

    if (renderStateArray === undefined) {

      renderState = new WebGLRenderState(this.extensions);
      this.renderStates.set(scene, [renderState]);

    } else {

      if (renderCallDepth >= renderStateArray.length) {

        renderState = new WebGLRenderState(this.extensions);
        renderStateArray.push(renderState);

      } else {

        renderState = renderStateArray[renderCallDepth];

      }

    }

    return renderState;

  }

  public dispose(): void {

    this.renderStates = new WeakMap();

  }

}
