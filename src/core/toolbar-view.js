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
    const newFile = createElement('div', 'fbv-toolbar-item fbv-text');
    const newDir = createElement('div', 'fbv-toolbar-item fbv-text');
    const rename = createElement('div', 'fbv-toolbar-item fbv-text');
    const remove = createElement('div', 'fbv-toolbar-item fbv-text');
    
    // Set up the structure.
    container.appendChild(newFile);
    container.appendChild(newDir);
    container.appendChild(rename);
    container.appendChild(remove);
    
    // Set attrubutes & values.
    newFile.appendChild(createElement('i', 'fa fa-file'));
    newDir.appendChild(createElement('i', 'fa fa-folder'));
    rename.appendChild(createElement('i', 'fa fa-pencil'));
    remove.appendChild(createElement('i', 'fa fa-trash'));

    // Bind listeners.
    const fileTreeView = this.browserView.fileTreeView;
    newFile.addEventListener('click', () => fileTreeView.showAddFileInput());
    newDir.addEventListener('click', () => fileTreeView.showAddDirInput());
    rename.addEventListener('click', () => fileTreeView.showRenameInput());
    remove.addEventListener('click', () => fileTreeView.showRemoveConfirm());

    this.elements.container = container;
    this.elements.buttons = {
      newFile,
      newDir,
      rename,
      remove,
    };
  }

  drawElements() {
    this.target.innerHTML = '';
    this.createLayout();
    this.target.appendChild(this.elements.container);
  }
}