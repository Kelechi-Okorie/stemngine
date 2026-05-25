import { TemplateNode } from "../../Interfaces";

const defaultTemplate: TemplateNode = {
  type: 'split',
  direction: 'column',
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
};

export { defaultTemplate }
