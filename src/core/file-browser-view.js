import FileTreeView from './file-tree-view';
import ToolbarView from './toolbar-view';
import { createDiv } from './drawer';
import './file-browser-view.css';
import '../themes/default-light.css';

const DEFAULT_OPTIONS = {
  theme: 'default-light',
  createFile: true,
  createDir: true,
  rename: true,
  remove: true,
};

export default class FileBrowserView {
  constructor(target, options = {}) {
    this.eventTarget = new EventTarget();
    this.target = target;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this.selectedItem = null;
    this.editMode = null;
    this.editTarget = null;
    this.items = {};

    this.elements = {};
    this.draw();
  }

  on(type, listener) {
    this.eventTarget.addEventListener(type, listener);
  }

  handleSelect(item) {

  }

  handleEdit(editMode, editTarget) {

  }

  // Draw DOM elements in the target element.
  draw() {
    // Create elements.
    const els = this.elements;
    els.container = createDiv(`fbv-container t-${this.options.theme}`);
    els.header = createDiv('fbv-header');
    els.container.appendChild(els.header);
    els.bodyContainer = createDiv('fbv-body-container');
    els.container.appendChild(els.bodyContainer);
    els.body = createDiv('fbv-body');
    els.bodyContainer.appendChild(els.body);

    // Bind children.
    this.fileTreeView = new FileTreeView(els.body, {
      eventTarget: this.eventTarget,
      items: this.items,
      options: this.options,
      handleSelect: item => this.handleSelect(item),
      handleEdit: (editMode, editTarget) => this.handleEdit(editMode, editTarget),
    });
    this.toolbarView = new ToolbarView(els.header, {

    });

    // Render.
    this.target.appendChild(els.container);
  }
}