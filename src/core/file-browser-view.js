import Files from './files';
import { createElement } from './render';
import './file-browser-view.css';

const DEFAULT_OPTIONS = {};
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
    this.files = new Files(this.elements.body, {
      ...this.options,
      depth: 0,
    });
    this.target.appendChild(this.elements.container);
  }
}