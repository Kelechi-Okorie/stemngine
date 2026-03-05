/**
 * Class responsible for clocking the system
 * and tracking simulation time
 *
 * The clock provides:
 * - { @link Clock.time } -> total elapsed time since the clock was created (seconds)
 * - { @link Clock.dt } -> time difference between the last two ticks (seconds)
 *
 * @remarks
 * The clock does not own the update loop itself; instead, it should be called
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
  private _dt: number = 0;

  /**
   * Scales the dt or passage of time by a factor.
   *
   * @remarks
   * This can be used to create slow-motion, or fast-forward, effects or even reverse time effects.
   *
   * When setting the timeScale, the dt is multiplied by this factor.
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
   * Whether to ignore tab inactivity when calculating dt.
   *
   * @remarks
   * `true` - pauses simulation when when browser tab is hidden
   * `false` - keeps simulation running when browser tab is hidden
   */
  public pauseOnTabInactivity: boolean = false; // TODO: maybe removed, since mainloop accounts for this

  /**
   * Constructs a new clock instance initializes
   * the starting reference time
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
   *   simulation.step(dt);
   * 
   *   // update scene using simulation result
   * 
   *   renderer.render(scene, camera)
   *
   * }
   * ```
   */
  constructor() {
    this.lastTime = performance.now();
  }

  public get time(): number {
    return this._time;
  }

  public get dt(): number {
    return this._dt;
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

    this._dt = rawDelta * this.timeScale;
    this._time += this.dt;
    this.lastTime = now;

  }

}
