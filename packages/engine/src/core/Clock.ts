/**
 * Class responsible for clocking the system
 * and trading simulation time
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
   *   renderer.render(world, alpha);
   *   requestAnimationFrame(gameLoop);
   * }
   *
   * gameLoop();
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

// TODO: to be removed
// in the renderer
// function render(world, alpha: number) {
//   for const prev = entity.prevPosition;
//   const curr = entity.position;

//   const renderPos = ProgressEvent.lerp(curr, alpha);
//   draw(renderPos)
// }


// TODO: to be removed
// how entities integrate with interpolation
// Interpolation works best if every physics-driven entity remembers its previous state and current state, so rendering can blend smoothly between them
/**
 * Core idea
 * - prevTransform -> state before the last physics step.
 * - transform (or currTransform) -> state after the last physics step.
 *
 * then, when rendering, you interpolate between the two using the alpha factor from the clock
 *
 * Why this matter
 * - keeps physics deterministic (no blending in simulation, only in rendering)
 * - makes rendering smooth regardless of frame rate
 * - same design scales up to 3D: store prevTransform (pos + rotation + scale) and interpolate with lerp / slerp
 * - Networking engines use exactly this trick with state snapshots to hide latency
 */
// interface Vector2 {
// x: number;
//   y: number;
//   lerp(to: Vector2, alpha: number): Vector2;
// }

// export class Entity {
//   /**
//    * Current transform (after last physics step).
//    */
//   public position: Vector2;

//   /**
//    * Previous transform (before last physics step).
//    */
//   public prevPosition: Vector2;

//   constructor(initial: Vector2) {
//     this.position = { ...initial, lerp };
//     this.prevPosition = { ...initial, lerp };
//   }

//   /**
//    * Called at the start of a physics step,
//    * to snapshot the current state for interpolation.
//    */
//   beginStep(): void {
//     this.prevPosition = { ...this.position, lerp };
//   }

//   /**
//    * Updates physics (e.g. velocity integration).
//    */
//   integrate(dt: number, velocity: Vector2): void {
//     this.position.x += velocity.x * dt;
//     this.position.y += velocity.y * dt;
//   }
// }

// helper for lerp
// function lerp(this: Vector2, to: Vector2, alpha: number): Vector2 {
//     return {
//         x: this.x + (to.x - this.x) * alpha,
//         y: this.y + (to.y - this.y) * alpha,
//         lerp
//     };
// }

// physics loop with snapshotting
// clock.stepFixed((dt) => {
//     for (const entity of world.entities) {
//         entity.beginStep();        // snapshot state
//         entity.integrate(dt, entity.velocity); // advance physics
//     }
// });

// rendering with interpolation
// function render(world, alpha: number) {
//     for (const entity of world.entities) {
//         const renderPos = entity.prevPosition.lerp(entity.position, alpha);
//         draw(renderPos); // draw at interpolated position
//     }
// }

// TODO: to be removed
// generalize into Interpolate<T> wrapper type, so any property (position, rotation, health, etc.) can be interpolated automatically by the engine
/**
 * The idea
 * - prev: T -> last state
 * - curr: T - current state
 * set(value: T) -> snapshot & update
 * get(alpha: number) -> returns interpolated value between prev and curr
 *
 * This works for any type that knows how to interpolate itself (lerp, slerp, blend, etc)
 */
// the interpolate wrapper
/**
 * A generic interpolated value that keeps track of previous and current states for smooth rendering between fixed steps
 *
 * Benefits
 * - works for any type (Vector2, Vector3, Quaternion, even color)
 * - Keeps API clean: entities just call .set() in physics and .get(alpha) in rendering
 * - future proof: you can add extrapolation (predicting beyond curr for networking)
 */
// export class Interpolated<T> {
//   public prev: T;
//   public curr: T;

//   constructor(initial: T) {
//     this.prev = initial;
//     this.curr = initial;
//   }

//   /**
//    * snapshots the current state and updates to a new one.
//    */
//   set(value: T): void {
//     this.prev = this.curr;
//     this.curr = value;
//   }

//   /**
//    * Gets the interplated value between prev and curr.
//    *
//    * @param alpha - interpolation factor [0, 1)
//    */
//   get(alpha: number, lerpFn: (a: T, b: T, alpha: number) => T): T {
//     return lerpFn(this.prev, this.curr, alpha);
//   }
// }
// /* Example for position */
// // lerp function for 2D vectors
// function lerpVec2(a: {x: number, y: number}, b: {x: number, y: number}, alpha: number) {
//   return {
//     x: a.x + (b.x - a.x) * alpha,
//     y: a.y + (b.y - a.y) * alpha
//   };
// }

// // Entity using Interpolated<T>
// class Entity {
//   public position: Interpolated<{x: number, y: number}>;

//   constructor(x: number, y: number) {
//     this.position = new Interpolated({x, y});
//   }

//   // physics update
//   integrate(dt: number, velocity: {x: number, y: number}) {
//     const newPos = {
//       x: this.position.curr.x + velocity.x * dt,
//       y: this.position.curr.y + velocity.y * dt
//     };
//     this.position.set(newPos);
//   }
// }

// // usage in loop
// // physics (fixed)
// clock.stepFixed((dt) => {
//   for (const entity of world.entities) {
//     entity.integrate(dt, entity.velocity)
//   }
// });

// // rendering (interpolated)
// const alpha = Clock.stepFixed(() => {});
// for (const entity of world.entities) {
//   const renderPos = entity.position.get(alpha, lerpVec2);
//   draw(renderPos);
// }

// TODO: To be removed
/**
 * Extending the above so that it auto-registers a lerp function per type (like Vector2.lerp, Quaternion.lerp) so you don't have to pass a lerp function every time when calling .get(alpha)
 *
 * New design
 * - Interpolated<T> takes a lerpFun at construction
 * - .get(alpha) automatically uses that function
 * - you can register reusable static helpers like Interpolated.vec2, Interpolated.quat, etc
 */

/**
 * Generic wrapper for interpolated values
 */
/**
 * Generic wrapper for interpolated values.
 */
// export class Interpolated<T> {
//   public prev: T;
//   public curr: T;
//   private lerpFn: (a: T, b: T, alpha: number) => T;

//   constructor(initial: T, lerpFn: (a: T, b: T, alpha: number) => T) {
//     this.prev = initial;
//     this.curr = initial;
//     this.lerpFn = lerpFn;
//   }

//   /**
//    * Snapshots the current state and updates to a new one.
//    */
//   set(value: T): void {
//     this.prev = this.curr;
//     this.curr = value;
//   }

//   /**
//    * Returns an interpolated value between prev and curr.
//    */
//   get(alpha: number): T {
//     return this.lerpFn(this.prev, this.curr, alpha);
//   }

//   /**
//    * Factory: Interpolated 2D vector
//    */
//   static vec2(x: number, y: number) {
//     return new Interpolated({ x, y }, (a, b, alpha) => ({
//       x: a.x + (b.x - a.x) * alpha,
//       y: a.y + (b.y - a.y) * alpha
//     }));
//   }

//   /**
//    * Factory: Interpolated 3D vector
//    */
//   static vec3(x: number, y: number, z: number) {
//     return new Interpolated({ x, y, z }, (a, b, alpha) => ({
//       x: a.x + (b.x - a.x) * alpha,
//       y: a.y + (b.y - a.y) * alpha,
//       z: a.z + (b.z - a.z) * alpha
//     }));
//   }

//   /**
//    * Factory: Interpolated Quaternion (rotation)
//    */
//   static quat(x: number, y: number, z: number, w: number) {
//     return new Interpolated({ x, y, z, w }, (a, b, alpha) => {
//       // naive lerp, can swap for slerp later
//       return {
//         x: a.x + (b.x - a.x) * alpha,
//         y: a.y + (b.y - a.y) * alpha,
//         z: a.z + (b.z - a.z) * alpha,
//         w: a.w + (b.w - a.w) * alpha
//       };
//     });
//   }
// }

// // example usage
// // Entity with interpolated position
// class Entity {
//     public position = Interpolated.vec2(0, 0);

//     integrate(dt: number, velocity: {x: number, y: number}) {
//         const newPos = {
//             x: this.position.curr.x + velocity.x * dt,
//             y: this.position.curr.y + velocity.y * dt
//         };
//         this.position.set(newPos);
//     }
// }

// // Physics loop
// clock.stepFixed((dt) => {
//     for (const e of world.entities) {
//         e.integrate(dt, e.velocity);
//     }
// });

// // Rendering loop
// function render(alpha: number) {
//     for (const e of world.entities) {
//         const pos = e.position.get(alpha); // ✅ no lerpFn needed
//         draw(pos);
//     }
// }

// TODO: to be removed
/**
 * hook this directly into the engine's component system so any component property can declare itself as interpolated. that way I don't even thingn about snapshots, the engine does it automatically
 *
 * Core idea
 * - Any component field can be marked as Interpolated<T>
 * - The engine will automatically
 *    1. Snapshot (.set()) every fixed physic step
 *    2. Interpolate (.get(alpha)) during render
 * - systems & renderers don't care whether the date is raw or interpolated - they just ask the engine for the "smoothed" version
 *
 * physics writed directly to postComp.value.curr
 * the engine snapshots automatically
 * rendering just calls .get(alpha)
 *
 * Benefits
 * - No manual .set() calls in your gameplay code
 * - works for any component property, not just position
 * keeps simulation deterministic but rendering smooth
 */

// example component
// PositionComponent.ts
// import { Interpolated } from "./Interpolated";

// export class PositionComponent {
//     value = Interpolated.vec2(0, 0);
// }

/**
 * system snapshot hook
 * in your engine worlf, you advance physics
 */
// class World {
//     entities: Entity[] = [];

//     // Called by the fixed timestep loop
//     step(dt: number) {
//         for (const e of this.entities) {
//             e.updatePhysics(dt);
//         }

//         // After updates, snapshot all interpolated components
//         this.snapshotInterpolated();
//     }

//     private snapshotInterpolated() {
//         for (const e of this.entities) {
//             for (const c of e.components) {
//                 for (const key in c) {
//                     const field = (c as any)[key];
//                     if (field instanceof Interpolated) {
//                         field.set(field.curr); // take snapshot
//                     }
//                 }
//             }
//         }
//     }
// }

// // rendering with interpolation
// function render(world: World, alpha: number) {
//     for (const e of world.entities) {
//         const posComp = e.get(PositionComponent);
//         if (posComp) {
//             const pos = posComp.value.get(alpha); // ✅ auto-interpolated
//             drawEntity(e, pos);
//         }
//     }
// }

// // usage flow
// // Physics loop (fixed 60Hz)
// world.step(dt);

// // Render loop (variable)
// render(world, alpha);

// TODO: to be removed
/**
 * refine so the engine knows exactly which fields are interpolated without scanning every property every frame
 *
 * Core refinement
 * instead of looping through all fields of every component, we'll
 * - register interpolated fields once (at component creation)
 * - keep a lightweight list of them in the world
 * - snapshot only those each step
 *
 * this avoids overhead and keep the ECS fast
 *
 * Benefits
 * - No wasted scans -  only actual interpolated fields are tracked
 * - automatic registration - components dont have to worry about the snapshot loop
 * - extensible - you can have interpolated vectors, quaternions, colors, scalars... all managed the same way
 * - clean seperation - ECS logic doesn't mix with engine timing code
 */

// making Interpolated field
// add helper InterpolatedField so components declared fields cleanly
// import { Interpolated } from "./Interpolated";

// /**
//  * Marks a field as interpolated and auto-registers it.
//  */
// export function InterpolatedField<T>(
//     world: World,
//     initial: T,
//     lerpFn: (a: T, b: T, alpha: number) => T
// ): Interpolated<T> {
//     const interp = new Interpolated(initial, lerpFn);
//     world.registerInterpolated(interp);
//     return interp;
// }

// world tracking
// class World {
//     private interpolatedFields: Interpolated<any>[] = [];

//     registerInterpolated(field: Interpolated<any>) {
//         this.interpolatedFields.push(field);
//     }

//     step(dt: number) {
//         // run physics updates
//         for (const e of this.entities) {
//             e.updatePhysics(dt);
//         }

//         // snapshot only registered interpolated fields
//         for (const f of this.interpolatedFields) {
//             f.set(f.curr);
//         }
//     }
// }

// component example
// class PositionComponent {
//     value: Interpolated<{ x: number; y: number }>;

//     constructor(world: World) {
//         this.value = InterpolatedField(world, { x: 0, y: 0 }, (a, b, alpha) => ({
//             x: a.x + (b.x - a.x) * alpha,
//             y: a.y + (b.y - a.y) * alpha,
//         }));
//     }
// }

// rendering example
// function render(world: World, alpha: number) {
//     for (const e of world.entities) {
//         const posComp = e.get(PositionComponent);
//         if (posComp) {
//             const pos = posComp.value.get(alpha);
//             drawEntity(e, pos);
//         }
//     }
// }

// TODO: to be removed
/**
 * make the above declarative with decorators (@interpolated) instead of calling InterpolatedField manually in each component - that makes the component look even cleaner
 *
 * Decorators are perfit for this. with @interpolated, your components declare what fields are interpolated, and the engingine automtically hooks ithem into the snapshot system
 *
 * Benefits
 * - Declarative - just add @interpolated and give it a lerp + initial
 * - Automatic registration - world manages the snapshot list
 * - Consistent API - rendering always uses .get(alpha)
 * - Extensible - you can define @vec2, @vec3, @quat decorators as shorthand for common cases
 */

// step 1: define the decorator
// use a property decorator that
// wraps the field in an Interpolated<T>
// registers it with the world once the component is constructed
// import { Interpolated } from "./Interpolated";
// import type { World } from "./World";

// type LerpFn<T> = (a: T, b: T, alpha: number) => T;

// /**
//  * Decorator for marking a field as interpolated.
//  */
// export function interpolated<T>(lerpFn: LerpFn<T>, initial: T) {
//     return function (target: any, propertyKey: string) {
//         const privateKey = `__${propertyKey}`;

//         Object.defineProperty(target, propertyKey, {
//             get() {
//                 return this[privateKey];
//             },
//             set(world: World) {
//                 // initialize and register with world
//                 const interp = new Interpolated(initial, lerpFn);
//                 world.registerInterpolated(interp);
//                 this[privateKey] = interp;
//             },
//             enumerable: true,
//             configurable: true,
//         });
//     };
// }

// // world implementation
// class World {
//     private interpolatedFields: Interpolated<any>[] = [];

//     registerInterpolated(field: Interpolated<any>) {
//         this.interpolatedFields.push(field);
//     }

//     step(dt: number) {
//         for (const e of this.entities) {
//             e.updatePhysics(dt);
//         }

//         for (const f of this.interpolatedFields) {
//             f.set(f.curr);
//         }
//     }
// }

// // use in component
// class PositionComponent {
//     @interpolated<{ x: number; y: number }>(
//         (a, b, alpha) => ({
//             x: a.x + (b.x - a.x) * alpha,
//             y: a.y + (b.y - a.y) * alpha,
//         }),
//         { x: 0, y: 0 }
//     )
//     value!: Interpolated<{ x: number; y: number }>;

//     constructor(world: World) {
//         // trigger decorator setup
//         this.value = world;
//     }
// }

// // rendering
// function render(world: World, alpha: number) {
//     for (const e of world.entities) {
//         const posComp = e.get(PositionComponent);
//         if (posComp) {
//             const pos = posComp.value.get(alpha);
//             drawEntity(e, pos);
//         }
//     }
// }

// TODO: to be removed
/**
 * using cleaner shorthand, like @vec2(0, 0) instead of writing the full lerp function each time
 *
 * this is super clean, like unity or three.js style, so you don't have to write the full lerp function each time
 *
 * create shorthand decorators for common types vec2, vec3, quat, etc
 *
 * Benefits
 * - Readable and clean - no custom lerp functione each time
 * - Automatic snapshot registration - engine handles everything
 * - Extensible - you can create more shorthand decorators: @quat, @color, @scalar
 * - Sacles nicely, - all interpolated fields workd with the same engine loop
 */

// define shorthand decorators
// import { Interpolated } from "./Interpolated";
// import type { World } from "./World";

// /**
//  * Vector2 shorthand: interpolated 2D vector
//  */
// export function vec2(x: number = 0, y: number = 0) {
//     return function (target: any, propertyKey: string) {
//         const privateKey = `__${propertyKey}`;
//         Object.defineProperty(target, propertyKey, {
//             get() {
//                 return this[privateKey];
//             },
//             set(world: World) {
//                 const interp = new Interpolated({ x, y }, (a, b, alpha) => ({
//                     x: a.x + (b.x - a.x) * alpha,
//                     y: a.y + (b.y - a.y) * alpha
//                 }));
//                 world.registerInterpolated(interp);
//                 this[privateKey] = interp;
//             },
//             enumerable: true,
//             configurable: true
//         });
//     };
// }

// /**
//  * Vector3 shorthand
//  */
// export function vec3(x = 0, y = 0, z = 0) {
//     return function (target: any, propertyKey: string) {
//         const privateKey = `__${propertyKey}`;
//         Object.defineProperty(target, propertyKey, {
//             get() {
//                 return this[privateKey];
//             },
//             set(world: World) {
//                 const interp = new Interpolated({ x, y, z }, (a, b, alpha) => ({
//                     x: a.x + (b.x - a.x) * alpha,
//                     y: a.y + (b.y - a.y) * alpha,
//                     z: a.z + (b.z - a.z) * alpha
//                 }));
//                 world.registerInterpolated(interp);
//                 this[privateKey] = interp;
//             },
//             enumerable: true,
//             configurable: true
//         });
//     };
// }

// // use in component
// class PositionComponent {
//     @vec2(0, 0)
//     value!: Interpolated<{ x: number; y: number }>;

//     constructor(world: World) {
//         this.value = world; // triggers decorator setup
//     }
// }

// class RotationComponent {
//     @vec3(0, 0, 0)
//     rotation!: Interpolated<{ x: number; y: number; z: number }>;

//     constructor(world: World) {
//         this.rotation = world;
//     }
// }

// // engine workflow
// // Physics loop (fixed timestep)
// clock.stepFixed((dt) => {
//     for (const e of world.entities) {
//         e.updatePhysics(dt);
//     }
// });

// // Rendering (interpolation)
// const alpha = clock.stepFixed(() => {});
// for (const e of world.entities) {
//     const pos = e.get(PositionComponent)?.value.get(alpha);
//     const rot = e.get(RotationComponent)?.rotation.get(alpha);
//     drawEntity(e, pos, rot);
// }

// TODO: to be removed
/**
 * combine all the pieces - Clock with timeScale, fixedDeltaTime, stepFixed, interpolated entities and decorators
 *
 * The setup gives you
 * - smooth rendering with interpolations
 * - fixed-timestep deterministic physics
 * - timeScale support for slow motion
 * - Decorator-based auto-registration on interpolated fields
 * - shorthand decorators for common types (vec2, vec3)
 */

// clock.ts
// export class Clock {
//     private lastTime: number;
//     public time: number = 0;
//     public deltaTime: number = 0;
//     public timeScale: number = 1;

//     public fixedDeltaTime: number = 1 / 60;
//     public maxAccumulated: number = 0.25;
//     private accumulator: number = 0;

//     constructor() {
//         this.lastTime = performance.now();
//     }

//     tick(): void {
//         const now = performance.now();
//         const rawDelta = (now - this.lastTime) / 1000;

//         this.deltaTime = rawDelta * this.timeScale;
//         this.time += this.deltaTime;
//         this.lastTime = now;

//         this.accumulator += this.deltaTime;
//         if (this.accumulator > this.maxAccumulated) {
//             this.accumulator = this.maxAccumulated;
//         }
//     }

//     stepFixed(step: (dt: number) => void): number {
//         while (this.accumulator >= this.fixedDeltaTime) {
//             step(this.fixedDeltaTime * this.timeScale);
//             this.accumulator -= this.fixedDeltaTime;
//         }
//         return this.accumulator / this.fixedDeltaTime;
//     }
// }

// // interpolated.ts
// export class Interpolated<T> {
//     public prev: T;
//     public curr: T;
//     private lerpFn: (a: T, b: T, alpha: number) => T;

//     constructor(initial: T, lerpFn: (a: T, b: T, alpha: number) => T) {
//         this.prev = initial;
//         this.curr = initial;
//         this.lerpFn = lerpFn;
//     }

//     set(value: T): void {
//         this.prev = this.curr;
//         this.curr = value;
//     }

//     get(alpha: number): T {
//         return this.lerpFn(this.prev, this.curr, alpha);
//     }
// }

// // decorators.ts
// import { Interpolated } from "./Interpolated";
// import type { World } from "./World";

// export function vec2(x = 0, y = 0) {
//     return function (target: any, propertyKey: string) {
//         const privateKey = `__${propertyKey}`;
//         Object.defineProperty(target, propertyKey, {
//             get() { return this[privateKey]; },
//             set(world: World) {
//                 const interp = new Interpolated({ x, y }, (a, b, alpha) => ({
//                     x: a.x + (b.x - a.x) * alpha,
//                     y: a.y + (b.y - a.y) * alpha
//                 }));
//                 world.registerInterpolated(interp);
//                 this[privateKey] = interp;
//             },
//             enumerable: true,
//             configurable: true
//         });
//     };
// }

// export function vec3(x = 0, y = 0, z = 0) {
//     return function (target: any, propertyKey: string) {
//         const privateKey = `__${propertyKey}`;
//         Object.defineProperty(target, propertyKey, {
//             get() { return this[privateKey]; },
//             set(world: World) {
//                 const interp = new Interpolated({ x, y, z }, (a, b, alpha) => ({
//                     x: a.x + (b.x - a.x) * alpha,
//                     y: a.y + (b.y - a.y) * alpha,
//                     z: a.z + (b.z - a.z) * alpha
//                 }));
//                 world.registerInterpolated(interp);
//                 this[privateKey] = interp;
//             },
//             enumerable: true,
//             configurable: true
//         });
//     };
// }

// // world.ts
// import { Interpolated } from "./Interpolated";

// export class World {
//     entities: any[] = [];
//     private interpolatedFields: Interpolated<any>[] = [];

//     registerInterpolated(field: Interpolated<any>) {
//         this.interpolatedFields.push(field);
//     }

//     step(dt: number) {
//         for (const e of this.entities) {
//             e.updatePhysics(dt);
//         }

//         for (const f of this.interpolatedFields) {
//             f.set(f.curr);
//         }
//     }
// }

// // components.ts
// import { Interpolated } from "./Interpolated";
// import { vec2 } from "./Decorators";
// import type { World } from "./World";

// export class PositionComponent {
//     @vec2(0, 0)
//     value!: Interpolated<{ x: number; y: number }>;

//     constructor(world: World) {
//         this.value = world; // triggers decorator registration
//     }
// }

// export class VelocityComponent {
//     @vec2(0, 0)
//     value!: Interpolated<{ x: number; y: number }>;

//     constructor(world: World) {
//         this.value = world;
//     }
// }

// // entity.ts
// export class Entity {
//     components: any[] = [];

//     addComponent(comp: any) {
//         this.components.push(comp);
//         return this;
//     }

//     get<T>(Comp: { new(...args: any[]): T }): T | undefined {
//         return this.components.find(c => c instanceof Comp);
//     }

//     updatePhysics(dt: number) {
//         const pos = this.get(PositionComponent)?.value;
//         const vel = this.get(VelocityComponent)?.value;
//         if (pos && vel) {
//             pos.set({
//                 x: pos.curr.x + vel.curr.x * dt,
//                 y: pos.curr.y + vel.curr.y * dt
//             });
//         }
//     }
// }

// // gameloop.ts
// const clock = new Clock();
// const world = new World();

// // create entity
// const player = new Entity()
//     .addComponent(new PositionComponent(world))
//     .addComponent(new VelocityComponent(world));

// player.get(VelocityComponent)!.value.set({ x: 50, y: 0 });
// world.entities.push(player);

// function gameLoop() {
//     clock.tick();

//     // variable timestep updates (animations, AI)
//     // world.update(clock.deltaTime);

//     // fixed timestep physics
//     const alpha = clock.stepFixed((dt) => world.step(dt));

//     // render interpolated
//     for (const e of world.entities) {
//         const pos = e.get(PositionComponent)?.value.get(alpha);
//         console.log(`Render pos: x=${pos?.x.toFixed(2)}, y=${pos?.y.toFixed(2)}`);
//     }

//     requestAnimationFrame(gameLoop);
// }

// gameLoop();
