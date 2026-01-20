import { FloatType } from '../../constants.js';
import { DataArrayTexture } from '../../textures/DataArrayTexture';
import { Vector4 } from '../../math/Vector4.js';
import { Vector2 } from '../../math/Vector2.js';
import { WebGLCapabilities } from './WebGLCapabilities.js';
import { BufferGeometry } from '../../core/BufferGeometry.js';
import { Node3D } from '../../core/Node3D.js';
import { WebGLTextures } from './WebGLTextures.js';

export class WebGLMorphtargets {
  private readonly gl: WebGL2RenderingContext;
  private readonly capabilities: WebGLCapabilities;
  // private readonly textures: Record<string, WebGLTexture>;
  private readonly textures: WebGLTextures;


  protected morphTextures = new WeakMap();
  protected morph = new Vector4();

  constructor(
    gl: WebGL2RenderingContext,
    capabilities: WebGLCapabilities,
    // textures: Record<string, WebGLTexture>
    textures: WebGLTextures
  ) {
    this.gl = gl;
    this.capabilities = capabilities;
    this.textures = textures;
  }

  public update(
    object: Node3D & {
      morphTargetInfluences: number[];
      morphTexture?: DataArrayTexture | null;
      isInstancedMesh?: boolean;
    },
    geometry: BufferGeometry & {
      morphAttributes: Record<'position' | 'normal' | 'color', Array<any>>;
      morphTargetsRelative?: boolean;
    },
    program: {
      getUniforms(): {
        setValue(gl: WebGL2RenderingContext, name: string, value: any, textures?: /* Record<string, WebGLTexture> */ WebGLTextures): void;
      };
    }
  ) {

    const objectInfluences = object.morphTargetInfluences;

    // the following encodes morph targets into an array of data textures. Each layer represents a single morph target.

    const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
    const morphTargetsCount = (morphAttribute !== undefined) ? morphAttribute.length : 0;

    let entry = this.morphTextures.get(geometry);

    if (entry === undefined || entry.count !== morphTargetsCount) {

      if (entry !== undefined) entry.texture.dispose();

      const hasMorphPosition = geometry.morphAttributes.position !== undefined;
      const hasMorphNormals = geometry.morphAttributes.normal !== undefined;
      const hasMorphColors = geometry.morphAttributes.color !== undefined;

      const morphTargets = geometry.morphAttributes.position || [];
      const morphNormals = geometry.morphAttributes.normal || [];
      const morphColors = geometry.morphAttributes.color || [];

      let vertexDataCount = 0;

      if (hasMorphPosition === true) vertexDataCount = 1;
      if (hasMorphNormals === true) vertexDataCount = 2;
      if (hasMorphColors === true) vertexDataCount = 3;

      let width = geometry.attributes.position.count * vertexDataCount;
      let height = 1;

      if (width > this.capabilities.maxTextureSize) {

        height = Math.ceil(width / this.capabilities.maxTextureSize);
        width = this.capabilities.maxTextureSize;

      }

      const buffer = new Float32Array(width * height * 4 * morphTargetsCount);

      const texture = new DataArrayTexture(buffer, width, height, morphTargetsCount);
      texture.type = FloatType;
      texture.needsUpdate = true;

      // fill buffer

      const vertexDataStride = vertexDataCount * 4;

      for (let i = 0; i < morphTargetsCount; i++) {

        const morphTarget = morphTargets[i];
        const morphNormal = morphNormals[i];
        const morphColor = morphColors[i];

        const offset = width * height * 4 * i;

        for (let j = 0; j < morphTarget.count; j++) {

          const stride = j * vertexDataStride;

          if (hasMorphPosition === true) {

            this.morph.fromBufferAttribute(morphTarget, j);

            buffer[offset + stride + 0] = this.morph.x;
            buffer[offset + stride + 1] = this.morph.y;
            buffer[offset + stride + 2] = this.morph.z;
            buffer[offset + stride + 3] = 0;

          }

          if (hasMorphNormals === true) {

            this.morph.fromBufferAttribute(morphNormal, j);

            buffer[offset + stride + 4] = this.morph.x;
            buffer[offset + stride + 5] = this.morph.y;
            buffer[offset + stride + 6] = this.morph.z;
            buffer[offset + stride + 7] = 0;

          }

          if (hasMorphColors === true) {

            this.morph.fromBufferAttribute(morphColor, j);

            buffer[offset + stride + 8] = this.morph.x;
            buffer[offset + stride + 9] = this.morph.y;
            buffer[offset + stride + 10] = this.morph.z;
            buffer[offset + stride + 11] = (morphColor.itemSize === 4) ? this.morph.w : 1;

          }

        }

      }

      entry = {
        count: morphTargetsCount,
        texture: texture,
        size: new Vector2(width, height)
      };

      this.morphTextures.set(geometry, entry);

      const disposeTexture = () => {

        texture.dispose();

        this.morphTextures.delete(geometry);

        geometry.removeEventListener('dispose', disposeTexture);

      }

      geometry.addEventListener('dispose', disposeTexture);

    }

    //
    if (object.isInstancedMesh === true && object.morphTexture !== null) {

      program.getUniforms().setValue(this.gl, 'morphTexture', object.morphTexture, this.textures);

    } else {

      let morphInfluencesSum = 0;

      for (let i = 0; i < objectInfluences.length; i++) {

        morphInfluencesSum += objectInfluences[i];

      }

      const morphBaseInfluence = geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;


      program.getUniforms().setValue(this.gl, 'morphTargetBaseInfluence', morphBaseInfluence);
      program.getUniforms().setValue(this.gl, 'morphTargetInfluences', objectInfluences);

    }

    program.getUniforms().setValue(this.gl, 'morphTargetsTexture', entry.texture, this.textures);
    program.getUniforms().setValue(this.gl, 'morphTargetsTextureSize', entry.size);

  }

}
