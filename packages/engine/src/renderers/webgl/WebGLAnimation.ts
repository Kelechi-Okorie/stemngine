export class WebGLAnimation {

  private context: Window | null = null;
  private isAnimating = false;
  private animationLoop: ((time: number, frame?: any) => void) | null = null;
  private requestId: number | null = null;

  constructor() { }

  private onAnimationFrame = (time: number, frame?: any) => {

    if (this.animationLoop) this.animationLoop(time, frame);

    if (this.context) this.requestId = this.context.requestAnimationFrame(this.onAnimationFrame);

  }


  public start(): void {

    if (this.isAnimating === true) return;
    if (this.animationLoop === null) return;

    if (!this.context) throw new Error('WebGLAnimation: context is not set.');

    this.requestId = this.context.requestAnimationFrame(this.onAnimationFrame);

    this.isAnimating = true;

  }

  public stop(): void {

    if (this.context && this.requestId !== null) {
      this.context.cancelAnimationFrame(this.requestId);
    }

    this.isAnimating = false;

  }

  public setAnimationLoop(callback: (time: number, frame?: any) => void): void {

    this.animationLoop = callback;

  }

  public setContext(value: Window): void {

    this.context = value;

  }
}
