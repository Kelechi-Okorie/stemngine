import { Context } from "../Interfaces";
import { ModalSystem } from "./ModalSystem";
import { AddToolModal } from "./modals/AddToolModal";
import { AddToolEvent } from "../tools/AddTool";

export class EditorShell {

  private context: Context;
  private modalSystem: ModalSystem;

  constructor(context: Context, container: HTMLElement) {
    this.context = context;
    this.modalSystem = new ModalSystem(container);

    this.setupEvents();
  }

  private setupEvents() {

    this.context.events.on(AddToolEvent.ADDTOOL_OPEN_MODAL, () => {


      const modal = new AddToolModal(this.context);
      const el = modal.render();

      this.modalSystem.open(el);

    });

  }

}
