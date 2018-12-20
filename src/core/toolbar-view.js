import { createElement } from './render';
import './toolbar-view.css';

export default class ToolbarView {
  constructor(browserView, target, options) {
    this.browserView = browserView;
    this.target = target;
    this.elements = {};
    this.options = options;
    this.drawElements();
  }

  createLayout() {
    const container = createElement('div', 'fbv-toolbar-container');
    const newFileButton = createElement('div', 'fbv-toolbar-item');
    const newDirButton = createElement('div', 'fbv-toolbar-item');
    const renameButton = createElement('div', 'fbv-toolbar-item');
    const removeButton = createElement('div', 'fbv-toolbar-item');
    const buttons = {};
    this.elements.buttons.newFile = createElement('div', 'fbv-toolbar-item');

    this.elements.buttons = [
      createElement('div', 'fbv-toolbar-item')
    ];
  }

  drawElements() {
    this.target.innerHTML = '';
    this.createLayout();
    this.target.appendChild(this.elements.container);
  }
}