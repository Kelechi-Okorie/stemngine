import { AnyTypedArray } from "../../constants";

export type GLBufferData = {
  buffer: WebGLBuffer | null;
  type: number;
  bytesPerElement: number;
  version: number;
  size?: number;
};

export interface GLAttribute {
  array: AnyTypedArray;
  usage: GLenum;
  version: number;
  onUploadCallback: () => void;
  clearUpdateRanges: () => void;
  updateRanges: { start: number; count: number }[];
  isInterleavedBufferAttribute?: boolean;
  data?: GLAttribute;
  isGLBufferAttribute?: boolean;
  elementSize?: number;
  type?: number;
  buffer?: WebGLBuffer;
  isFloat16BufferAttribute?: boolean;
}

declare var Float16Array: any;

export function WebGLAttributes(gl: WebGL2RenderingContext) {

  const buffers = new WeakMap<GLAttribute, GLBufferData>();

  function createBuffer(attribute: GLAttribute, bufferType: GLenum) {

    const array = attribute.array;
    const usage = attribute.usage;
    const size = array.byteLength;

    const buffer = gl.createBuffer();

    gl.bindBuffer(bufferType, buffer);
    gl.bufferData(bufferType, array, usage);

    attribute.onUploadCallback();

    let type: number;

    if (array instanceof Float32Array) {

      type = gl.FLOAT;

    } else if (typeof Float16Array !== 'undefined' && array instanceof Float16Array) {

      type = gl.HALF_FLOAT;

    } else if (array instanceof Uint16Array) {

      if (attribute.isFloat16BufferAttribute) {

        type = gl.HALF_FLOAT;

      } else {

        type = gl.UNSIGNED_SHORT;

      }

    } else if (array instanceof Int16Array) {

      type = gl.SHORT;

    } else if (array instanceof Uint32Array) {

      type = gl.UNSIGNED_INT;

    } else if (array instanceof Int32Array) {

      type = gl.INT;

    } else if (array instanceof Int8Array) {

      type = gl.BYTE;

    } else if (array instanceof Uint8Array) {

      type = gl.UNSIGNED_BYTE;

    } else if (array instanceof Uint8ClampedArray) {

      type = gl.UNSIGNED_BYTE;

    } else {

      throw new Error('WebGLAttributes: Unsupported buffer data format: ' + array);

    }

    return {
      buffer: buffer,
      type: type,
      bytesPerElement: array.BYTES_PER_ELEMENT,
      version: attribute.version,
      size: size
    };

  }

  function updateBuffer(buffer: WebGLBuffer, attribute: GLAttribute, bufferType: GLenum) {

    const array = attribute.array;
    const updateRanges = attribute.updateRanges;

    gl.bindBuffer(bufferType, buffer);

    if (updateRanges.length === 0) {

      // Not using update ranges
      gl.bufferSubData(bufferType, 0, array);

    } else {

      // Before applying update ranges, we merge any adjacent / overlapping
      // ranges to reduce load on `gl.bufferSubData`. Empirically, this has led
      // to performance improvements for applications which make heavy use of
      // update ranges. Likely due to GPU command overhead.
      //
      // Note that to reduce garbage collection between frames, we merge the
      // update ranges in-place. This is safe because this method will clear the
      // update ranges once updated.

      updateRanges.sort((a, b) => a.start - b.start);

      // To merge the update ranges in-place, we work from left to right in the
      // existing updateRanges array, merging ranges. This may result in a final
      // array which is smaller than the original. This index tracks the last
      // index representing a merged range, any data after this index can be
      // trimmed once the merge algorithm is completed.
      let mergeIndex = 0;

      for (let i = 1; i < updateRanges.length; i++) {

        const previousRange = updateRanges[mergeIndex];
        const range = updateRanges[i];

        // We add one here to merge adjacent ranges. This is safe because ranges
        // operate over positive integers.
        if (range.start <= previousRange.start + previousRange.count + 1) {

          previousRange.count = Math.max(
            previousRange.count,
            range.start + range.count - previousRange.start
          );

        } else {

          ++mergeIndex;
          updateRanges[mergeIndex] = range;

        }

      }

      // Trim the array to only contain the merged ranges.
      updateRanges.length = mergeIndex + 1;

      for (let i = 0, l = updateRanges.length; i < l; i++) {

        const range = updateRanges[i];

        gl.bufferSubData(bufferType, range.start * array.BYTES_PER_ELEMENT,
          array, range.start, range.count);

      }

      attribute.clearUpdateRanges();

    }

    attribute.onUploadCallback();

  }

  //

  function get(attribute: GLAttribute): GLBufferData | undefined {

    if (attribute.isInterleavedBufferAttribute && attribute.data) attribute = attribute.data;

    return buffers.get(attribute);

  }

  function remove(attribute: GLAttribute) {

    if (attribute.isInterleavedBufferAttribute && attribute.data) attribute = attribute.data;

    const data = buffers.get(attribute);

    if (data) {

      gl.deleteBuffer(data.buffer);

      buffers.delete(attribute);

    }

  }

  function update(attribute: GLAttribute, bufferType: GLenum) {

    if (attribute.isInterleavedBufferAttribute && attribute.data) attribute = attribute.data;

    if (attribute.isGLBufferAttribute) {

      const cached = buffers.get(attribute);

      if (!cached || cached.version < attribute.version) {

        buffers.set(attribute, {
          buffer: attribute.buffer!,
          type: attribute.type!,
          bytesPerElement: attribute.elementSize!,
          version: attribute.version
        });

      }

      return;

    }

    const data = buffers.get(attribute);

    if (data === undefined) {

      buffers.set(attribute, createBuffer(attribute, bufferType));

    } else if (data.version < attribute.version) {

      if (data.size !== attribute.array.byteLength) {

        throw new Error('WebGLAttributes: The size of the buffer attribute\'s array buffer does not match the original size. Resizing buffer attributes is not supported.');

      }

      updateBuffer(data.buffer!, attribute, bufferType);

      data.version = attribute.version;

    }

  }

  return {

    get: get,
    remove: remove,
    update: update

  };

}
