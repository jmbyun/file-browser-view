import FileItemView from './file-item-view';
import { createDiv } from './drawer';
import './file-tree-view.css';

export default class FileTreeView {
  constructor(target, props) {
    this.target = target;
    this.props = props;
    this.items = {};
    this.paths = [];
    this.rootItems = [];
    this.selectedItem = null;
    this.addFileItem = null;

    this.elements = {};
    this.draw();
  }

  getValue() {
    return this.paths.map(p => this.items[p].line).join('\n');
  }

  getValueLines() {
    return this.props.options.value.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
  }

  showAddFile() {
    this.hideEditor();
    const item = this.selectedItem;
    const itemContainer = createDiv('fbv-tree-item');
    let basePath = '/';
    if (item) {
      basePath = item.isDir() ? item.path : item.getParentPath();
    }
    const line = (basePath === '/' ? '' : basePath) + '_?newFile';
    this.addFileItem = new FileItemView(itemContainer, {
      line,
      handleEdit: this.addFile,
      handleEditCancel: this.hideEditor,
    });
    if (basePath === '/') {
      const container = this.elements.container;
      container.insertBefore(itemContainer, container.firstChild);
    } else {
      const baseItem = this.items[basePath];
      baseItem.expand();
      baseItem.insertTempChild(itemContainer);
    }
  }

  showAddDir() {

  }

  showEdit() {

  }

  showRemove() {

  }

  hideEditor = () => {
    if (this.addFileItem) {
      this.addFileItem.remove();
      this.addFileItem = null;
    }
  };

  addFile() {
    
  }

  addDir() {

  }

  editItem() {

  }

  removeItem() {

  }

  // updateEditMode(editMode, editTarget) {
  //   const { handleEdit, handleEditCancel } = this.props;
  //   if (editMode === 'newFile') {
  //     const itemContainer = createDiv('fbv-tree-item');
  //     let basePath = '/';
  //     if (editTarget) {
  //       basePath = editTarget.isDir() ? editTarget.path : editTarget.getParentPath();
  //     }
  //     const line = (basePath === '/' ? '' : basePath) + '_?newFile';
  //     this.newFileItem = new FileItemView(itemContainer, { 
  //       line, 
  //       handleEdit,
  //       handleEditCancel,
  //     });
  //     if (basePath === '/') {
  //       const container = this.elements.container;
  //       container.insertBefore(itemContainer, container.firstChild);
  //     } else {
  //       const baseItem = this.items[basePath];
  //       baseItem.expand();
  //       baseItem.insertTempChild(itemContainer);
  //     }
  //   }
  // }

  handleSelect = item => {
    this.hideEditor();
    if (this.selectedItem) {
      this.selectedItem.unselect();
    }
    item.select();
    this.selectedItem = item;
    this.props.dispatch('select', { item });
  };

  // Draw DOM elements in the target element.
  draw() {
    const {
      on,
      dispatch,
      handleChange,
      handleEditModeChange,
      // handleSelect,
    } = this.props;
    const handleSelect = this.handleSelect;
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
      this.items[item.path] = item;
      for (const ancestorPath of item.getAncestorPaths()) {
        if (!this.items[ancestorPath]) {
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
          this.items[ancestor.path] = ancestor;
        }
      }
    }

    // Sort items.
    this.paths = Object.keys(this.items);
    this.paths.sort((a, b) => a > b ? 1 : -1);

    // Set hierarchy between items.
    for (const path of this.paths) {
      const item = this.items[path];
      const parentPath = item.getParentPath();
      if (parentPath === '/') {
        this.rootItems.push(item);
      } else {
        this.items[parentPath].addChild(item);
      }
    }
    
    // Draw root items.
    for (const item of this.rootItems) {
      els.container.appendChild(item.target);
    }

    this.target.appendChild(els.container);
  }
}
