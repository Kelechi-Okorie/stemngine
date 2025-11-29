declare global {
  interface ArrayBuffer {
    _uuid?: string; // to allow ArrayBuffer.buffer to have a _uuid property
  }
}

export {};  // ensures ths is a module so augmentation works
