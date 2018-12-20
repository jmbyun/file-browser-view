import { createElement } from './render';
import FileTree from './file-tree';
import FileItem from './file-item';
import './file-tree-view.css';

const ENTER_KEY_CODE = 13;
const ESC_KEY_CODE = 27;

export default class FileTreeView {
  constructor(browserView, target, options) {
    this.browserView = browserView;
    this.target = target;
    this.elements = {};
    this.options = options;
    this.selectedPath = null;
    this.edit = {};
    this.fileTree = new FileTree(options.value);
    this.drawElements();
    this.bindMethods();
  }

  bindMethods() {
    this.hideAddFileInput = this.hideAddFileInput.bind(this);
  }

  getValue() {
    return this.fileTree.toValue();
  }

  setValue(value) {
    this.fileTree = new FileTree(value);
    this.drawElements();
  }

  dispatch(typeArg, eventInit) {
    return this.browserView.dispatch(typeArg, eventInit);
  }

  getSelectedDirItem() {
    if (this.selectedPath) {
      const item = this.fileTree.items[this.selectedPath];
      const parentPath = item.getParentPath();
      if (parentPath !== '/') {
        return this.fileTree.items[parentPath];
      }
    }
    return null;
  }
  
  showAddFileInput() {
    const item = this.getSelectedDirItem();
    const parent = item ? 
      this.elements.items[item.path].children : 
      this.elements.container;
    const container = this.elements.addFile.container;
    const input = this.elements.addFile.input;
    parent.insertBefore(container, parent.firstChild);
    input.focus();
    this.browserView.on('click', this.hideAddFileInput);
  }

  hideAddFileInput() {
    const container = this.elements.addFile.container;
    const input = this.elements.addFile.input;
    input.value = '';
    container.parentElement.removeChild(container);
    this.browserView.off('click', this.hideAddFileInput);
  }

  showAddDirInput() {

  }

  showRenameInput() {

  }

  showRemoveConfirm() {

  }

  collapseItem(item) {
    item.collapse();
    const element = this.elements.items[item.path];
    element.arrow.classList.remove('fbv-tree-arrow-down');
    element.arrow.classList.add('fbv-tree-arrow-right');
    element.children.style.display = 'none';
    this.dispatch('collapse', { path: item.path });
    this.dispatch('change', { path: item.path, options: item.options });
  }

  expandItem(item) {
    item.expand();
    const element = this.elements.items[item.path];
    element.arrow.classList.remove('fbv-tree-arrow-right');
    element.arrow.classList.add('fbv-tree-arrow-down');
    element.children.style.display = 'block';
    this.dispatch('expand', { path: item.path });
    this.dispatch('change', { path: item.path, options: item.options });
  }

  selectItem(item) {
    if (this.selectedPath) {
      this.elements.items[this.selectedPath]
        .rowContainer
        .classList
        .remove('fbv-tree-row-container--active');
    }
    this.selectedPath = item.path;
    this.elements.items[item.path]
      .rowContainer
      .classList
      .add('fbv-tree-row-container--active');
    this.dispatch('select', { path: item.path });
  }

  handleRowClick(item) {
    this.dispatch('click', { path: item.path });
    if (item.dir) {
      if (item.isExpand()) {
        this.collapseItem(item);
      } else {
        this.expandItem(item);
      }
    }
    this.selectItem(item);
  }

  handleAddFile() {
    const promise = new Promise((resolve, reject) => {
      this.dispatch('addfile', {
        cancel() {
          reject();
        }
      });
    });
    setTimeout(() => {
      const item = this.getSelectedDirItem();
      item.
    }, 0);
    return promise;
  }

  handleEditCancel() {

  }

  createLayout() {
    this.elements.container = createElement('div', 'fbv-tree-container');
    this.elements.items = {};
  }

  createAddFileInput() {
    const container = createElement('div', 'fbv-tree-item-container');
    const rowContainer = createElement('div', 'fbv-tree-row-container');
    const row = createElement('div', 'fbv-tree-item-row');
    const setDepth = depth => { 
      row.style.paddingLeft = `${depth * this.options.indentSize * 0.0625}rem`;
    };
    const icon = createElement('div', 'fbv-tree-item-icon');
    const fileIcon = createElement('i', 'fa fa-file');
    const input = createElement('input', 'fbv-tree-input');

    icon.appendChild(fileIcon);
    row.appendChild(icon);
    row.appendChild(input);
    rowContainer.appendChild(row);
    container.appendChild(rowContainer);

    input.addEventListener('keyup', async e => {
      if (e.keyCode === ENTER_KEY_CODE) {
        if (await this.handleAddFile(input.value)) {
          this.hideAddFileInput();
        }
      } else if (e.keyCode === ESC_KEY_CODE) {
        this.hideAddFileInput();
      }
    });

    this.elements.addFile = { container, input, setDepth };
  }

  createItem(item, target, depth) {
    const paddingLeft = `${depth * this.options.indentSize * 0.0625}rem`;
    const container = createElement('div', 'fbv-tree-item-container');
    const rowContainer = createElement('div', 'fbv-tree-row-container');
    const row = createElement('div', 'fbv-tree-item-row', { paddingLeft });
    const children = createElement('div', 'fbv-tree-item-children');
    const icon = createElement('div', 'fbv-tree-item-icon');
    const arrow = createElement('div');
    const fileIcon = createElement('i', 'fa fa-file');
    const title = createElement('div', 'fbv-tree-item-title fbv-text');
    const info = createElement('div', 'fbv-tree-item-info');

    // Set up the structure.
    if (item.dir) {
      icon.appendChild(arrow);
    } else {
      icon.appendChild(fileIcon);
    }
    row.appendChild(icon);
    row.appendChild(title);
    row.appendChild(info);
    rowContainer.appendChild(row);
    container.appendChild(rowContainer);
    container.appendChild(children);
    target.appendChild(container);
    
    // Set attributes & values.
    title.innerHTML = item.title;
    row.style.cursor = 'pointer';
    if (item.isExpand()) {
      arrow.className = 'fbv-tree-arrow-down';
    } else {
      arrow.className = 'fbv-tree-arrow-right';
      children.style.display = 'none';
    }

    // Bind listeners.
    row.addEventListener('click', () => this.handleRowClick(item));

    for (const child of item.children) {
      this.createItem(child, children, depth + 1);
    }
    this.elements.items[item.path] = {
      container,
      rowContainer,
      icon,
      arrow,
      title,
      info,
      children,
    };
  }

  drawElements() {
    this.target.innerHTML = '';
    this.createLayout();
    this.createAddFileInput();
    for (const item of this.fileTree.rootItems) {
      this.createItem(
        item, this.elements.container, 0)
    }
    this.target.appendChild(this.elements.container);
  }
}