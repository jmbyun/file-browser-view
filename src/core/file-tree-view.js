import FileItemView from './file-item-view';
import { createDiv } from './drawer';
import './file-tree-view.css';

export default class FileTreeView {
  constructor(target, props) {
    this.target = target;
    this.props = props;
    this.paths = [];
    this.rootItems = [];
    this.newFileItem = null;

    this.elements = {};
    this.draw();
  }

  getValueLines() {
    return this.props.options.value.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
  }

  updateEditMode(editMode, editTarget) {
    const { handleEdit } = this.props;
    if (editMode === 'newFile') {
      const itemContainer = createDiv('fbv-tree-item');
      let basePath = '/';
      if (editTarget) {
        basePath = editTarget.isDir() ? editTarget.path : editTarget.getParentPath();
      }
      const line = (basePath === '/' ? '' : basePath) + '_?newFile';
      this.newFileItem = new FileItemView(itemContainer, { line, handleEdit });
      if (basePath === '/') {
        const container = this.elements.container;
        container.insertBefore(itemContainer, container.firstChild);
      } else {
        const baseItem = this.props.items[basePath];
        baseItem.expand();
        baseItem.insertTempChild(itemContainer);
      }
    }
  }

  // Draw DOM elements in the target element.
  draw() {
    const {
      on,
      dispatch,
      handleChange,
      handleEditModeChange,
      handleSelect,
    } = this.props;
    const els = this.elements;
    els.container = createDiv('fbv-tree-container');
    els.items = {};

    // Create all required FileItemView instances. 
    for (const line of this.getValueLines()) {
      const itemContainer = createDiv('fbv-tree-item');
      const item = new FileItemView(itemContainer, {
        line,
        on,
        dispatch,
        handleChange,
        handleEditModeChange,
        handleSelect,
      });
      els.items[item.path] = itemContainer;
      this.props.items[item.path] = item;
      for (const ancestorPath of item.getAncestorPaths()) {
        if (!this.props.items[ancestorPath]) {
          const ancestorContainer = createDiv('fbv-tree-item');
          const ancestor = new FileItemView(ancestorContainer, {
            line: ancestorPath,
            on,
            dispatch,
            handleChange,
            handleEditModeChange,
            handleSelect,
          });
          els.items[ancestor.path] = ancestorContainer;
          this.props.items[ancestor.path] = ancestor;
        }
      }
    }

    // Sort items.
    this.paths = Object.keys(this.props.items);
    this.paths.sort((a, b) => a > b ? 1 : -1);

    // Set hierarchy between items.
    for (const path of this.paths) {
      const item = this.props.items[path];
      const parentPath = item.getParentPath();
      if (parentPath === '/') {
        this.rootItems.push(item);
      } else {
        this.props.items[parentPath].addChild(item);
      }
    }
    
    // Draw root items.
    for (const item of this.rootItems) {
      els.container.appendChild(item.target);
    }

    this.target.appendChild(els.container);
  }
}
