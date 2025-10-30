// src/types/core/clock.d.ts

/**
 * Options that can be used to configure a clock instance
 */
export interface ClockOptions {
  /** Time scaling factor. 1.0 = normal, <1 = slow, >1 = fast, 0 = paused, < 0 = reversed */
  timeScale?: number;

  /** Fixed time step for physics or other fixed updates (in seconds). Default 1/60 */
  fixedDeltaTime?: number

  /** Maximum accumulated time to prevent spiral of death (in seconds). Default 0.25  */
  maxAccumulatedTime?: number
}

/**
 * Function type used for fixed-step updates.
 * @param dt - timestep in seconds
 */
export type stepFunction = (dt: number) => void;

/**
 * Core clock class for tracking elapsed time and managine fixed-step updates
 */
export declare class Clock {
  /**
   * scales the passage of time. 1.0 = normal, 0 = paused, <0 = reverse.
   */
  public timeScale: number;

  /**
   * Fixed timestep for physics and other fixed-rate updates (seconds)
   */
  public fixedDeltaTime: number;

  /**
   * Maximum time allowed to accumulate for physics steps (seconds)
   */
  public maxAccumulatedTime: number;

  /**
   * constructs a new Clock instance.
   * @param options - optional configuration
   */
  constructor(options?: ClockOptions);

  /**
   * Advances the clok the the current time.
   * Updates internal deltaTime and accumulators.
   */
  public tick(): void;

  /**
   * Runs fixed-step updates as many times as needed.
   * @params stepFn - callback to run per fixed step
   * @returns interpolation factor in [0, 1)
   */
  public stepFixed(stepFn: stepFunction): number;
}
