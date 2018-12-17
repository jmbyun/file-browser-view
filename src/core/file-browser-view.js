import FileTreeView from './file-tree-view';
import { createElement } from './render';
import './file-browser-view.css';

const DEFAULT_OPTIONS = {
  indentSize: 16, 
};
export default class FileBrowserView {
  constructor(target, options = {}) {
    this.target = target;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this.elements = {};
    this.drawElements();
  }

  createLayout() {
    const container = createElement('div', 'fbv-container');
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
    this.fileTreeView = new FileTreeView(this.elements.body, this.options);
    this.target.appendChild(this.elements.container);
  }
}