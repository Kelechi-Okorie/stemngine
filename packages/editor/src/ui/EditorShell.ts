import { Context } from "../Interfaces";
import { ModalSystem } from "./ModalSystem";
import { AddToolModal } from "./modals/AddToolModal";
import { AddToolEvent } from "../tools/AddTool";
import { OutlinerModal } from "./modals/OutlinerModal";
import { OutlinerEvent } from "../tools/OutlinerTool";
import { ObjectInspectorModal } from "./modals/ObjectInspectorModal";
import { ObjectInspectorEvent } from "../tools/ObjectInspectorTool";
import { InspectorEvent } from "../tools/InspectorTool";
import { InspectorModal } from "./modals/InspectorModal";

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

      this.modalSystem.open('add', el, 'add');

    });

    this.context.events.on(OutlinerEvent.OUTLINER_OPEN_MODAL, () => {

      const modal = new OutlinerModal(this.context);
      const el = modal.render();

      this.modalSystem.open('outline', el, 'outline');

    });

    this.context.events.on(ObjectInspectorEvent.OBJECT_INSPECTOR_OPEN_MODAL, () => {

      const modal = new ObjectInspectorModal(this.context);
      const el = modal.render();

      this.modalSystem.open('object inspector', el, 'object inspector');

    });

    this.context.events.on(InspectorEvent.INSPECTOR_OPEN_MODAL, () => {

      const modal = new InspectorModal(this.context);
      const el = modal.render();

      this.modalSystem.open('inspector', el, "Inspector");

    });

  }

}
