import { BufferData } from './WebGL';

export class Buffer {
  data: BufferData;
  constructor(data: BufferData) {
    this.data = data;
  }
}
