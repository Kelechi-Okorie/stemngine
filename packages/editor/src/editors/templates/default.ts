import { TemplateNode } from "../../Interfaces";

const defaultTemplate: TemplateNode = {
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
    type: 'split',
    direction: 'vertical',
    ratio: 0.3,
    a: {
      type: 'leaf',
      name: 'outliner',
      editorType: 'outliner'
    },
    b: {
      type: 'leaf',
      name: 'properties',
      editorType: 'properties'
    }
  }
};

export {defaultTemplate}
