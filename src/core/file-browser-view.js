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
    this.elements = {};
    this.draw();
  }

  getValue() {
    return this.fileTreeView.getValue();
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

  handleEditModeChange = editMode => {
    switch (editMode) {
      case 'newFile':
        this.fileTreeView.showAddFile();
        break;

      case 'newDir':
        this.fileTreeView.showAddDir();
        break;

      case 'rename':
        this.fileTreeView.showRename();
        break;

      case 'remove':
        this.fileTreeView.showRemove();
        break;

      default:
        break;
    }
  };

  confirmEdit = (editMode, editTarget, detail) => {
    const methods = {};
    const promise = new Promise((resolve, reject) => {
      methods.resolve = () => resolve();
      this.dispatch(editMode, {
        cancel: () => reject(),
        ...detail,
      });
    });
    setTimeout(() => methods.resolve(), 0);
    return promise;
  };

  handleEdit = (editMode, editTarget, detail) => {
    return this.confirmEdit(editMode, editTarget, detail);
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
      options,
      handleChange,
      handleEditModeChange,
      handleEdit,
    } = this;
    this.fileTreeView = new FileTreeView(els.body, {
      on,
      dispatch,
      options,
      handleChange,
      handleEdit,
    });
    this.toolbarView = new ToolbarView(els.header, {
      handleEditModeChange,
    });

    // Render.
    this.target.appendChild(els.container);
  }
}