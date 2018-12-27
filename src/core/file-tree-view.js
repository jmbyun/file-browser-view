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
    this.addDirItem = null;

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

  addRootItem(item) {
    const els = this.elements;

    this.rootItems.push(item);
    this.rootItems.sort((a, b) => a.path > b.path ? 1 : -1);
    const index = this.rootItems.indexOf(item);
    if (index === this.rootItems.length - 1) {
      els.container.appendChild(item.target);
    } else {
      els.container.insertBefore(item.target, this.rootItems[index + 1].target);
    }
  }

  showAddItem(isDir) {
    this.hideEditor();
    const item = this.selectedItem;
    const itemContainer = createDiv('fbv-tree-item');
    let basePath = '/';
    if (item) {
      basePath = item.isDir() ? item.path : item.getParentPath();
    }
    const line = [
      basePath === '/' ? '' : basePath,
      '_?',
      isDir ? 'newDir' : 'newFile',
    ].join('');
    const handleEdit = isDir ? this.addDir : this.addFile;
    const newItem = new FileItemView(itemContainer, {
      line,
      handleEdit,
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
    newItem.focusInput();
    if (isDir) {
      this.addDirItem = newItem;
    } else {
      this.addFileItem = newItem;
    }
  }

  showAddFile() {
    this.showAddItem(false);
  }

  showAddDir() {
    this.showAddItem(true);
  }

  showRename() {
    this.hideEditor();
    const item = this.selectedItem;
    if (!item) {
      return;
    }
    item.showRename({
      handleEdit: this.rename,
      handleEditCancel: this.hideEditor,
    });
    this.renameItem = item;
  }

  showRemove() {

  }

  hideEditor = () => {
    if (this.addFileItem) {
      this.addFileItem.remove();
      this.addFileItem = null;
    }
    if (this.addDirItem) {
      this.addDirItem.remove();
      this.addDirItem = null;
    }
    if (this.renameItem) {
      this.renameItem.cancelRename();
      this.renameItem = null;
    }
  };

  addItem = (item, detail, isDir) => {
    const { title } = detail;
    const els = this.elements;
    const basePath = item.getParentPath();
    const line = [
      basePath === '/' ? '' : basePath,
      title,
      isDir ? '/' : '',
    ].join('');
    const {
      on,
      dispatch,
      handleChange,
    } = this.props;
    const editMode = isDir ? 'newDir' : 'newFile';
    const element = createDiv('fbv-tree-item');
    const newItem = new FileItemView(element, {
      line,
      on,
      dispatch,
      handleChange,
      handleSelect: this.handleSelect,
    });
    this.props.handleEdit(editMode, newItem, { path: newItem.path })
      .then(() => {
        els.items[newItem.path] = element;
        this.items[newItem.path] = newItem;
        const parentPath = newItem.getParentPath();
        if (parentPath === '/') {
          this.addRootItem(newItem);
        } else {
          this.items[parentPath].addChild(newItem);
        }
      })
      .catch(() => {
        // Do nothing.
      });
    this.hideEditor();
  };

  addFile = (item, detail) => {
    return this.addItem(item, detail, false);
  };

  addDir = (item, detail) => {
    return this.addItem(item, detail, true);
  };

  rename = (item, detail) => {
    const { title } = detail;
    const oldPath = item.path;
    const oldTitle = item.title;
    item.rename(title);
    this.props.handleEdit('rename', item, { path: item.path })
      .then(() => {
        if (item.isDir()) {
          Object.keys(this.items)
            .filter(key => this.items[key].path.startsWith(oldPath))
            .forEach(key => {
              const i = this.items[key];
              i.path = i.path.replace(oldPath, item.path);
              i.updateLine();
            });
        }
      })
      .catch(() => {
        item.rename(oldTitle);
      });
    this.hideEditor();
  };

  remove() {

  }

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
        this.items[parentPath].appendChild(item);
      }
    }
    
    // Draw root items.
    for (const item of this.rootItems) {
      els.container.appendChild(item.target);
    }

    this.target.appendChild(els.container);
  }
}
