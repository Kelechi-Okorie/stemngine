import { EventDispatcher } from "../core/EventDispatcher";
import { Node3D } from "../core/Node3D";

const _EPS = 0.000001;

/**
 * Controllers recieve an InputState reference, not events
 *
 * Input may come from
 * -  Mouse
 * -  Touch
 * -  Keyboard
 * -  Equations
 * -  Sliders
 * -  Sensors
 * -  Recorded datasets
 * -  Networked experiments
 * -  Synthetic input e.g. input.state.pointer.delta.set(1, 0);
 * -  Simulation-driven intent e.g orbit.rotate(f(t), g(t))
 * And controllers don't care
 */
export abstract class Controls<T> extends EventDispatcher {

  /**
   * The object that is managed by the control
   *
   */
  public object: T;

  /**
   * The HTML element used for event listeners
   *
   */
  public domElement: HTMLElement;

  /**
   * Enable / disable controller without distroying it
   */
  public enabled: boolean = true;

  constructor(object: T, domElement: HTMLElement) {

    super();

    this.object = object;
    this.domElement = domElement;
  }

  /**
   * Update controller state
   * Called once per frame
   * Mus be deterministic
   */
  public update(dt: number | null): void {}

  /**
   * Dispose resources (event hooks, references)
   */
  public dispose(): void {}
}
