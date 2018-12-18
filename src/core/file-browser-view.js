import FileTreeView from './file-tree-view';
import { createElement } from './render';
import './file-browser-view.css';
import '../themes/default-light.css';

const DEFAULT_OPTIONS = {
  indentSize: 16, 
  theme: 'default-light',
};
export default class FileBrowserView extends EventTarget {
  constructor(target, options = {}) {
    super();
    this.target = target;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this.elements = {};
    this.drawElements();
  }

  on(typeArg, listener) {
    this.addEventListener(typeArg, listener);
  }

  off(typeArg, listener) {
    this.removeEventListener(typeArg, listener);
  }

  getValue() {
    return this.fileTreeView.getValue();
  }

  setOption(key, value) {
    this.options[key] = value;
    switch (key) {
      case 'value':
        this.fileTreeView.setValue(value);
        break;
    
      default:
        break;
    }
  }

  dispatch(typeArg, eventInit) {
    const event = new Event(typeArg, eventInit);
    return this.dispatchEvent(event);
  }

  createLayout() {
    const container = createElement('div', `fbv-container t-${this.options.theme}`);
    const header = createElement('div', 'fbv-header');
    const bodyContainer = createElement('div', 'fbv-body-container');
    const body = createElement('div', 'fbv-body');
    container.appendChild(header);
    container.appendChild(bodyContainer);
    bodyContainer.appendChild(body);
    this.elements.header = header;
    this.elements.body = body;
    this.elements.container = container;
  }

  drawElements() {
    this.createLayout();
    this.fileTreeView = new FileTreeView(this, this.elements.body, this.options);
    this.target.appendChild(this.elements.container);
  }
}