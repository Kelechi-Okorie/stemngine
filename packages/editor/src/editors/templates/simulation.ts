import { TemplateNode } from "../../Interfaces";

const simulationTemplate: TemplateNode = {
  type: 'split',
  direction: 'horizontal',
  ratio: 0.7,
  a: {
    type: 'split',
    direction: 'vertical',
    ratio: 0.7,
    a: {
      type: 'leaf',
      name: 'viewport',
      editorType: 'viewport'
    },
    b: {
      type: 'leaf',
      name: 'player',
      editorType: 'player'
    }
  },
  b: {
    type: 'leaf',
    name: 'control panel',
    editorType: 'control_panel',
  }
};

export {simulationTemplate}
