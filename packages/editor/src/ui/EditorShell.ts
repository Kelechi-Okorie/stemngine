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
import { WorldInspectorModal } from "./modals/WorldInspectorModal";
import { WorldInspectorEvent } from "../tools/WorldInspectorTool";
import { AddSolverModal, AddSolversEvent } from "./modals/AddSolverModal";

export class EditorShell {

  private context: Context;
  private modalSystem: ModalSystem;

  constructor(context: Context, container: HTMLElement) {
    this.context = context;
    this.modalSystem = new ModalSystem(container);

    this.setupEvents();
  }

  private setupEvents() {

    /** add entity */
    this.context.events.on(AddToolEvent.OPEN_MODAL, () => {

      const name = AddToolModal.name;

      const modal = new AddToolModal(this.context); // TODO: modals should have a static name that will be used to reference them globally
      const el = modal.render();

      this.modalSystem.open(name, el, name);

    });

    /** outliner */
    this.context.events.on(OutlinerEvent.OPEN_MODAL, () => {

      const name = OutlinerModal.name;

      const modal = new OutlinerModal(this.context);
      const el = modal.render();

      this.modalSystem.open(name, el, name);

    });

    /** object inspector */
    this.context.events.on(ObjectInspectorEvent.OPEN_MODAL, () => {

      const name = ObjectInspectorModal.name;

      const modal = new ObjectInspectorModal(this.context);
      const el = modal.render();

      const existing = this.modalSystem.get(name);

      if (existing) {
        // ✅ update existing inspector
        existing.setContent(el);
      } else {
        // ✅ create if not open
        this.modalSystem.open(name, el, name);
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


    /** world inspector */
    this.context.events.on(WorldInspectorEvent.OPEN_MODAL, () => {

      const name = WorldInspectorModal.name;

      const modal = new WorldInspectorModal(this.context);
      const el = modal.render();

      // this.modalSystem.open('World Inspector', el, 'world inspector');

      const existing = this.modalSystem.get(name);

      if (existing) {

        // ✅ update existing inspector
        existing.setContent(el);

      } else {

        // ✅ create if not open
        this.modalSystem.open(name, el, name);

      }

    });

    this.context.events.on(AddSolversEvent.OPEN_MODAL, () => {

      const name = AddSolverModal.name;

      const modal = new AddSolverModal(this.context);
      const el = modal.render();

      this.modalSystem.open(name, el, name);

    });

    this.context.events.on(AddSolversEvent.SOLVER_ADDED, () => {

      // open world inspector
      this.context.events.emit({
        type: WorldInspectorEvent.OPEN_MODAL,
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
