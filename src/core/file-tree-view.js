import { createElement } from './render';
import { FileTree } from './tree';
import './file-tree-view.css';

export default class FileTreeView {
  constructor(browserView, target, options) {
    this.browserView = browserView;
    this.target = target;
    this.elements = {};
    this.options = options;
    this.selectedPath = null;
    this.fileTree = new FileTree(options.value);
    this.drawElements();
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
  
  showAddFileInput() {

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
  }

  expandItem(item) {
    item.expand();
    const element = this.elements.items[item.path];
    element.arrow.classList.remove('fbv-tree-arrow-right');
    element.arrow.classList.add('fbv-tree-arrow-down');
    element.children.style.display = 'block';
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
  }

  handleRowClick(item) {
    if (item.dir) {
      if (item.isExpand()) {
        this.collapseItem(item);
        this.dispatch('collapse', { path: item.path });
      } else {
        this.expandItem(item);
        this.dispatch('expand', { path: item.path });
      }
    }
    this.dispatch('change', { path: item.path, options: item.options });
    this.selectItem(item);
    this.dispatch('select', { path: item.path });
  }

  createLayout() {
    this.elements.container = createElement('div', 'fbv-tree-container');
    this.elements.items = {};
  }

  createItem(item, target, depth) {
    const paddingLeft = `${depth * this.options.indentSize * 0.0625}rem`;
    const container = createElement('div', 'fbv-tree-item-container');
    const rowContainer = createElement('div', 'fbv-tree-row-container');
    const row = createElement('div', 'fbv-tree-item-row', { paddingLeft });
    const children = createElement('div', 'fbv-tree-item-children');
    const icon = createElement('div', 'fbv-tree-item-icon');
    const arrow = createElement('div');
    const title = createElement('div', 'fbv-tree-item-title fbv-text');
    const info = createElement('div', 'fbv-tree-item-info');

    // Set up the structure.
    if (item.dir) {
      icon.appendChild(arrow);
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
    for (const item of this.fileTree.rootItems) {
      this.createItem(
        item, this.elements.container, 0)
    }
    this.target.appendChild(this.elements.container);
  }
}