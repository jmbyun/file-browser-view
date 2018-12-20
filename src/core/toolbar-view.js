import { createDiv, createAnchor, createIcon } from './drawer';
import './toolbar-view.css';

export default class ToolbarView {
  constructor(target, options) {
    // this.browserView = browserView;
    this.target = target;
    this.elements = {};
    this.options = options;
    this.drawElements();
  }

  createLayout() {
    const container = createDiv('fbv-toolbar-container');
    const newFile = createAnchor('fbv-toolbar-item fbv-text');
    const newDir = createAnchor('fbv-toolbar-item fbv-text');
    const rename = createAnchor('fbv-toolbar-item fbv-text');
    const remove = createAnchor('fbv-toolbar-item fbv-text');

    // Set up the structure.
    container.appendChild(newFile);
    container.appendChild(newDir);
    container.appendChild(rename);
    container.appendChild(remove);

    // Set attrubutes & values.
    newFile.appendChild(createIcon('fa fa-file'));
    newDir.appendChild(createIcon('fa fa-folder'));
    rename.appendChild(createIcon('fa fa-pencil'));
    remove.appendChild(createIcon('fa fa-trash'));

    // Bind listeners.
    // const fileTreeView = this.browserView.fileTreeView;
    // newFile.addEventListener('click', () => fileTreeView.showAddFileInput());
    // newDir.addEventListener('click', () => fileTreeView.showAddDirInput());
    // rename.addEventListener('click', () => fileTreeView.showRenameInput());
    // remove.addEventListener('click', () => fileTreeView.showRemoveConfirm());

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