export function WebGLAnimation() {

  let context: any = null;
  let isAnimating: boolean = false;
  let animationLoop: ((time: number, frame: any) => void) | null = null;
  let requestId: number | null = null;

  function onAnimationFrame(time: number, frame: any) {

    if (animationLoop) {
      animationLoop(time, frame);
    }

    requestId = context.requestAnimationFrame(onAnimationFrame);

  }

  return {

    start: function (): void {

      if (isAnimating === true) return;
      if (animationLoop === null) return;

      requestId = context.requestAnimationFrame(onAnimationFrame);

      isAnimating = true;

    },

    stop: function () {

      context.cancelAnimationFrame(requestId);

      isAnimating = false;

    },

    setAnimationLoop: function (callback: (time: number, frame?: any) => void): void {

      animationLoop = callback;

    },

    setContext: function (
      value: {
        requestAnimationFrame: Function;
        cancelAnimationFrame: Function
      }
    ): void {

      context = value;

    }

  };

}
