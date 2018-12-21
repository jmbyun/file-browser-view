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

  getValue() {
    const paths = Object.keys(this.items);
    paths.sort((a, b) => a > b ? 1 : -1);
    return paths.map(p => this.items[p].line).join('\n');
  }

  on = (type, listener) => {
    this.eventTarget.addEventListener(type, listener);
  };

  dispatch = (typeArg, eventInit) => {
    const event = new Event(typeArg, eventInit);
    return this.eventTarget.dispatchEvent(event);
  };

  handleChange = item => {
    this.dispatch('change', { item });
  };

  handleSelect = item => {
    if (this.selectedItem) {
      this.selectedItem.unselect();
    }
    item.select();
    this.selectedItem = item;
    this.dispatch('select', { item });
  };

  handleEdit = (editMode, editTarget) => {

  };

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
    const { 
      on,
      dispatch,
      items,
      options,
      handleChange,
      handleSelect,
      handleEdit,
    } = this;
    this.fileTreeView = new FileTreeView(els.body, {
      on,
      dispatch,
      items,
      options,
      handleChange,
      handleSelect,
      handleEdit,
    });
    this.toolbarView = new ToolbarView(els.header, {

    });

    // Render.
    this.target.appendChild(els.container);
  }
}