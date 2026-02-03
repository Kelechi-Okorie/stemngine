/**
 * Class responsible for clocking the system
 * and tracking simulation time
 *
 * The clock provides:
 * - { @link Clock.time } -> total elapsed time since the clock was created (seconds)
 * - { @link Clock.deltaTime } -> time difference between the last two ticks (seconds)
 *
 * @remarks
 * The clock does not own the update loop itself; instead, it is should be called
 * once per frame by the engine's main loop.
 */
export class Clock {
  private lastTime: number;

  /**
   * Total elapsed time since the clock started (in seconds)
   *
   * @defaultValue 0
   */
  private _time: number = 0;

  /**
  * Time elapsed between the last two ticks (in seconds)
  *
  * @defaultValue 0
  */
  private _deltaTime: number = 0;

  /**
   * Scales the deltaTime or passage of time by a factor.
   *
   * @remarks
   * This can be used to create slow-motion, or fast-forward, effects or even reverse time effects.
   *
   * When setting the timeScale, the deltaTime is multiplied by this factor.
   * - `1.0` -> normal speed
   * - `< 1.0` -> slow motion
   * - `> 1.0` -> fast forward
   * - `0.0` -> pause
   * - `< 0.0` -> reverse time
   *
   * @defaultValue 1
   */
  public timeScale: number = 1;

  /**
   * Fixed time step for physics and other fixed-rate updates (in seconds)
   *
   * @defaultValue `1 / 60 ` ( = 0.016 seconds, 60fps)
   */
  public fixedDeltaTime: number = 1 / 60;

  /**
   * Accumulator used for catching up fixed steps
   *
   * @internal
   */
  private accumulator: number = 0;

  /**
   * Maximum time allowed to accumulate for physics steps (in seconds)
   * prevents the "spiral of death" when frames stall.
   *
   * @defaultValue 0.25 (quarter of a second)
   */
  public maxAccumulatedTime: number = 0.25;

  /**
   * Whether to ignore tab inactivity when calculating deltaTime.
   *
   * @remarks
   * `true` - pauses simulation when when browser tab is hidden
   * `false` - keeps simulation running when browser tab is hidden
   */
  public pauseOnTabInactivity: boolean = false;

  /**
   * Constructs a new clock instance initializes
   * the starting reference time
   *
   * @remarks
   * The clock is a core service that provides consistent timing for
   * all engine systems (physics, animation,  AI, rendering, etc.).
   * It does not own the main loop - instead, it is called once per
   * frame to update its internal time state.
   *
   * @example
   * ```ts
   * const clock = new Clock();
   *
   * const renderer = new WebGLRenderer();
   * renderer.setAnimationLoop(gameLoop)
   *
   * function gameLoop() {
   *   clock.tick();
   *
   *   // variable timestep systems (animations, input, rendering, etc.)
   *   world.update(clock.deltaTime);
   *
   *   // fixed timestep systems (physics, AI, networking, etc.)
   *   const alpha = clock.stepFixed((dt) => {
   *     physicsWorld.step(dt);
   *   });
   *
   *  // render with interpolation factor alpha
   *   renderer.render(scene, camera)
   *   // renderer.render(world, alpha);
   * }
   * ```
   */
  constructor() {
    this.lastTime = performance.now();
  }

  public get time(): number {
    return this._time;
  }

  public get deltaTime(): number {
    return this._deltaTime;
  }

  /**
   * Advances the clock to the current time.
   *
   * @remarks
   * should be called once per frame inside the game loop.
   * Updates both accumulated {@link Clock.time} and {@link Clock.deltaTime}
   */
  public tick(timestamp?: number): void {
    const now = timestamp || performance.now();
    let rawDelta = (now - this.lastTime) / 1000; // convert ms to s

    // avoid huge deltas when tab is inactive
    if (this.pauseOnTabInactivity && document?.hidden) rawDelta = 0;

    this._deltaTime = rawDelta * this.timeScale;
    this._time += this.deltaTime;
    this.lastTime = now;

    this.accumulator += this.deltaTime;

    // clamp accumulator to prevent spiral of death
    this.accumulator = Math.min(this.accumulator, this.maxAccumulatedTime);
  }

  /**
   * Runs fixed-timestep updates as many times as needed
   *
   * @param stepFn - callback to run once per fixed update/step
   * @returns interpolation factor in `[0, 1)` to be used for rendering
   *
   * @remarks
   * Benefits of alpha (interpolation factor):
   *  - Smooth rendering even at low or unstable frame rates.
   *  - Decouples rendering from physics update rate.
   *  - Allows interpolation between physics states for rendering.
   *
   * Drawbacks:
   *  - Adds complexity to rendering code.
   *  - Can introduce slight input lag if not tuned carefully.
   *  - May cause artifacts if physics and rendering are not synchronized.
   *
   * Physics remain deterministic and stable, while rendering can stay silky smooth regardless of FPS.
   */
  public stepFixed(stepFn: (dt: number) => void): number {

    while (this.accumulator >= this.fixedDeltaTime) {
      const dt = this.fixedDeltaTime * this.timeScale;
      stepFn(dt);
      this.accumulator -= this.fixedDeltaTime
    }

    // alpha tells renderer how far into the next frame we are
    /**
     * benefits of alpha:
     * - smooth rendering even with low fps
     * - decouples rendering from physics update rate
     * - can help with visual stuttering when fps is unstable
     * - allows for interpolation between physics states for rendering
     *
     * - physics stays deterministic and stable
     * - Rendering is silky smooth even if frame rate doesn't match physics rate
     * - same trick works for rotations, animations, and other interpolatable properties
     *
     * drawbacks of alpha:
     * - adds complexity to rendering code
     * - can introduce slight input lag if not handled properly
     * - may cause visual artifacts if physics and rendering are not well synchronized
     * - requires careful tuning of fixedDeltaTime and maxAccumulatedTime
     */
    return this.accumulator / this.fixedDeltaTime;   // alpha

  }
}
