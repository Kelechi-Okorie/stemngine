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
import { EntityEventType } from "../core/SimulationManager";
import { SelectionEventType } from "../core/SelectionManager";

export class EditorShell {

  private context: Context;
  private modalSystem: ModalSystem;

  constructor(context: Context, container: HTMLElement) {
    this.context = context;
    this.modalSystem = new ModalSystem(container);

    this.setupEvents();
  }

  private setupEvents() {

    this.context.events.on(AddToolEvent.OPEN_MODAL, () => {

      const modal = new AddToolModal(this.context); // TODO: modals should have a static name that will be used to reference them globally
      const el = modal.render();

      this.modalSystem.open('add', el, 'add');

    });

    this.context.events.on(OutlinerEvent.OPEN_MODAL, () => {

      const modal = new OutlinerModal(this.context);
      const el = modal.render();

      this.modalSystem.open('outline', el, 'outline');

    });

    this.context.events.on(ObjectInspectorEvent.OPEN_MODAL, () => {

      const modal = new ObjectInspectorModal(this.context);
      const el = modal.render();

      const existing = this.modalSystem.get('object inspector');

      if (existing) {
        // ✅ update existing inspector
        existing.setContent(el);
      } else {
        // ✅ create if not open
        this.modalSystem.open('object inspector', el, 'object inspector');
      }

    });





    this.context.events.on(EntityEventType.ENTITY_CREATED, () => {

      // close add modal
      // this.modalSystem.close('add');

      this.context.events.emit({
        type: ObjectInspectorEvent.OPEN_MODAL,
        target: this
      });

    });

    this.context.events.on(SelectionEventType.SELECTION_CHANGED, () => {

      // open object inspector
      this.context.events.emit({
        type: ObjectInspectorEvent.OPEN_MODAL,
        target: this
      });

    });






    // TODO: to be removed
    this.context.events.on(InspectorEvent.INSPECTOR_OPEN_MODAL, () => {

      const modal = new InspectorModal(this.context);
      const el = modal.render();

      this.modalSystem.open('inspector', el, "Inspector");

    });


  }

}
