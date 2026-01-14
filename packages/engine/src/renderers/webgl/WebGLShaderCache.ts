// import { WebGLMaterials } from "./WebGLMaterials";

let _id = 0;

export class WebGLShaderCache {

  public shaderCache = new Map();
  public materialCache = new Map();


  constructor() { }

  public update(material: any) { // TODO: type very well

    const vertexShader = material.vertexShader;
    const fragmentShader = material.fragmentShader;

    const vertexShaderStage = this._getShaderStage(vertexShader);
    const fragmentShaderStage = this._getShaderStage(fragmentShader);

    const materialShaders = this._getShaderCacheForMaterial(material);

    if (materialShaders.has(vertexShaderStage) === false) {

      materialShaders.add(vertexShaderStage);
      vertexShaderStage.usedTimes++;

    }

    if (materialShaders.has(fragmentShaderStage) === false) {

      materialShaders.add(fragmentShaderStage);
      fragmentShaderStage.usedTimes++;

    }

    return this;

  }

  public remove(material: any) {  // TODO: type very well

    const materialShaders = this.materialCache.get(material);

    for (const shaderStage of materialShaders) {

      shaderStage.usedTimes--;

      if (shaderStage.usedTimes === 0) this.shaderCache.delete(shaderStage.code);

    }

    this.materialCache.delete(material);

    return this;

  }

  public getVertexShaderID(material: any) { // TODO: type very well

    return this._getShaderStage(material.vertexShader).id;

  }

  public getFragmentShaderID(material: any) { // TODO: type well

    return this._getShaderStage(material.fragmentShader).id;

  }

  public dispose() {

    this.shaderCache.clear();
    this.materialCache.clear();

  }

  public _getShaderCacheForMaterial(material: any) {

    const cache = this.materialCache;
    let set = cache.get(material);

    if (set === undefined) {

      set = new Set();
      cache.set(material, set);

    }

    return set;

  }

  public _getShaderStage(code: any) {

    const cache = this.shaderCache;
    let stage = cache.get(code);

    if (stage === undefined) {

      stage = new WebGLShaderStage(code);
      cache.set(code, stage);

    }

    return stage;

  }

}

class WebGLShaderStage {
  public id: number;

  public code: any;
  public usedTimes = 0;


  constructor(code: any) {

    this.id = _id++;

    this.code = code;
  }

}
