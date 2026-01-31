import { Node3D } from "../engine.core";
import { InputState } from "../inputs/InputManager";
import { Controller } from "./Controls";

export class TransformController implements Controller<Node3D> {

  public enabled = true;
  public target: Node3D;
  public input: InputState;

  constructor(target: Node3D, input: InputState) {
    this.target = target;
    this.input = input
  }

  public update(dt: number) {
    if (!this.enabled) return;

    if (this.input.pointer.buttons.has(0)) {
      this.target.position.x += this.input.pointer.delta.x * 0.01;
    }
  }

  public dispose(): void {

  }
}
