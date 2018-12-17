import { createElement } from './render';
import { FileTree } from './tree';
import './file-tree-view.css';

export default class FileTreeView {
  constructor(target, options) {
    this.target = target;
    this.elements = {};
    this.options = options;
    this.fileTree = new FileTree(options.value);
    this.drawElements();
  }

  createLayout() {
    this.elements.container = createElement('div', 'fbv-tree-container');
    this.elements.items = {};
  }

  createItem(item, target, depth) {
    const paddingLeft = `${this.options.indentSize * 0.0625}rem`;
    const container = createElement('div', 'fbv-tree-item-container');
    const row = createElement('div', 'fbv-tree-item-row', { paddingLeft });
    const children = createElement('div', 'fbv-tree-item-children');
    const icon = createElement('div', 'fbv-tree-item-icon');
    icon.innerHTML = 'I';
    const title = createElement('div', 'fbv-tree-item-title');
    title.innderHTML = item.title;
    const info = createElement('div', 'fbv-tree-item-info');
    row.appendChild(icon);
    row.appendChild(title);
    row.appendChild(info);
    container.appendChild(row);
    container.appendChild(children);
    target.appendChild(container);
    for (const child of item.children) {
      this.createItem(child, children, depth + 1);
    }
    this.elements.items[item.path] = {
      container,
      icon,
      title,
      info,
      children,
    };
  }

  drawElements() {
    this.createLayout();
    for (const item of this.fileTree.rootItems) {
      this.createItem(
        item, this.elements.container, 0)
    }
    this.target.appendChild(this.elements.container);
  }
}