function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function createElement(tag, className, style) {
  const element = document.createElement(tag);
  element.className = className;
  Object.keys(style || {}).forEach(key => {
    element.style[key] = style[key];
  });
  return element;
}
function createDiv(className, style) {
  return createElement('div', className, style);
}
function createIcon(className, style) {
  return createElement('i', className, style);
}
function createAnchor(className, style) {
  return createElement('a', className, style);
}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".fbv-item-container {\n  padding: 0;\n}\n\n.fbv-item-row-container {\n  padding: 0 0.5rem;\n}\n\n.fbv-item-row {\n  display: flex;\n  align-items: center;\n  flex-flow: row nowrap;\n  padding-top: 0.1rem;\n  padding-bottom: 0.1rem;\n  cursor: pointer;\n}\n\n.fbv-item-icon {\n  flex: 0 0 auto;\n  min-width: 1.25rem;\n  padding-right: 0.5rem;\n  font-size: 0.8rem;\n}\n\n.fbv-item-main {\n  flex: 1 1 auto;\n}\n\n.fbv-item-title {\n  \n}\n\n.fbv-item-children {\n\n}\n\n.fbv-item-input {\n  border-width: 1px;\n  border-style: solid;\n  outline: 0;\n  padding: 0.25rem 0.25rem;\n  width: 100%;\n}";
styleInject(css);

const INDENT_SIZE = 0.5;
const ENTER_KEY_CODE = 13;
const ESC_KEY_CODE = 27;
class FileItemView {
  constructor(target, props) {
    _defineProperty(this, "focusInput", () => {
      this.elements.input.focus();
    });

    const lineTokens = props.line.split('?');
    this.target = target;
    this.props = props;
    this.line = props.line;
    this.path = lineTokens[0].replace('*', '').trim();
    this.options = {
      expand: lineTokens[0].endsWith('*'),
      dir: this.path.endsWith('/'),
      ...(lineTokens.length > 1 ? this.parseOptions(lineTokens[1]) : {})
    };
    this.pathTokens = this.path.split('/').filter(p => p !== '');
    this.title = this.pathTokens[this.pathTokens.length - 1];
    this.children = [];
    this.elements = {};
    this.draw();
  }

  isDir() {
    return this.options.dir;
  }

  isEdit() {
    const {
      newFile,
      newDir,
      rename
    } = this.options;
    return newFile || newDir || rename;
  }

  updateLine() {
    const params = Object.keys(this.options).filter(key => !['expand', 'dir'].includes(key)).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.options[key])}`).join('&');
    const expand = this.options.expand ? '*' : '';
    const separator = params ? '?' : '';
    this.line = `${this.path}${expand}${separator}${params}`;
  }

  parseOptions(query) {
    const options = {};
    const pairs = query.split('&');

    for (const pair of pairs) {
      if (pair.includes('=')) {
        const pairTokens = pair.trim().split('=');
        options[decodeURIComponent(pairTokens[0])] = decodeURIComponent(pairTokens[1]);
      } else {
        options[decodeURIComponent(pair.trim())] = true;
      }
    }

    return options;
  }

  getAncestorPaths() {
    const paths = [];

    for (let depth = 1; depth < this.pathTokens.length; depth++) {
      paths.push(this.pathTokens.slice(0, depth).join('/') + '/');
    }

    return paths;
  }

  getParentPath() {
    return this.pathTokens.slice(0, this.pathTokens.length - 1).join('/') + '/';
  }

  insertTempChild(child) {
    const els = this.elements;
    const firstChild = els.children.firstChild;

    if (firstChild) {
      els.children.insertBefore(child, firstChild);
    } else {
      els.children.appendChild(child);
    }
  }

  appendChild(child) {
    this.children.push(child);
    this.elements.children.appendChild(child.target);
  }

  addChild(child) {
    const els = this.elements;
    const items = this.children;
    items.push(child);
    items.sort((a, b) => a.path > b.path ? 1 : -1);
    const index = items.indexOf(child);

    if (index === items.length - 1) {
      els.children.appendChild(child.target);
    } else {
      console.log('before', items[index + 1].target);
      els.children.insertBefore(child.target, items[index + 1].target);
    }
  }

  select() {
    const els = this.elements;
    els.rowContainer.classList.add('fbv-item-row-container--active');
  }

  unselect() {
    const els = this.elements;
    els.rowContainer.classList.remove('fbv-item-row-container--active');
  }

  collapse() {
    const els = this.elements;
    this.options.expand = false;
    els.icon.className = 'fa fa-angle-right';
    els.children.style.display = 'none';
    this.updateLine();
    this.props.handleChange(this);
  }

  expand() {
    const els = this.elements;
    this.options.expand = true;
    els.icon.className = 'fa fa-angle-down';
    els.children.style.display = 'block';
    this.updateLine();
    this.props.handleChange(this);
  }

  remove() {
    this.target.removeChild(this.elements.container);
  }

  handleClickRow(e) {
    if (this.options.dir) {
      if (this.options.expand) {
        this.collapse();
      } else {
        this.expand();
      }
    }

    this.props.handleSelect(this);
  }

  drawIcon() {
    const els = this.elements;
    const {
      newFile,
      newDir,
      dir,
      expand
    } = this.options;
    els.iconContainer.innerHTML = '';

    if (newFile) {
      els.icon = createIcon('fa fa-file');
    } else if (newDir) {
      els.icon = createIcon('fa fa-folder');
    } else if (dir) {
      if (expand) {
        els.icon = createIcon('fa fa-angle-down');
      } else {
        els.icon = createIcon('fa fa-angle-right');
      }
    } else {
      els.icon = createIcon('fa fa-file');
    }

    els.iconContainer.appendChild(els.icon);
  }

  drawMainItem() {
    const {
      rename
    } = this.options;
    const els = this.elements;
    els.main.innerHTML = '';

    if (this.isEdit()) {
      els.input = createElement('input', 'fbv-item-input');

      if (rename) {
        els.input.value = this.title;
      }

      els.input.addEventListener('keyup', e => {
        if (e.keyCode === ENTER_KEY_CODE) {
          this.props.handleEdit(this, {
            title: els.input.value
          });
        } else if (e.keyCode === ESC_KEY_CODE) {
          this.props.handleEditCancel();
        }
      });
      els.main.appendChild(els.input);
    } else {
      els.title = createDiv('fbv-item-title');
      els.title.innerHTML = this.title;
      els.main.appendChild(els.title);
    }
  } // Draw DOM elements in the target element.


  draw() {
    // Create and structure elements.
    const els = this.elements;
    els.container = createDiv('fbv-item-container');
    els.rowContainer = createDiv('fbv-item-row-container');
    els.container.appendChild(els.rowContainer);
    els.row = createDiv('fbv-item-row');
    els.rowContainer.appendChild(els.row);
    els.iconContainer = createDiv('fbv-item-icon');
    els.row.appendChild(els.iconContainer);
    this.drawIcon();
    els.main = createDiv('fbv-item-main');
    els.row.appendChild(els.main);
    this.drawMainItem();
    els.children = createDiv('fbv-item-children');
    els.container.appendChild(els.children); // Set padding left according to the depth of the item.

    const depth = this.pathTokens.length - 1;
    els.row.style.paddingLeft = `${depth * INDENT_SIZE}rem`; // Set visibility of the children.

    if (!this.options.expand) {
      els.children.style.display = 'none';
    } // Bind listeners to elements.


    if (!this.isEdit()) {
      els.row.addEventListener('click', e => this.handleClickRow(e));
    }

    this.target.appendChild(els.container);
  }

}

var css$1 = ".fbv-tree-container {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow-y: auto;\n}\n\n.fbv-tree-item {\n  display: block;\n}";
styleInject(css$1);

class FileTreeView {
  constructor(target, props) {
    _defineProperty(this, "hideEditor", () => {
      if (this.addFileItem) {
        this.addFileItem.remove();
        this.addFileItem = null;
      }
    });

    _defineProperty(this, "addFile", (item, detail) => {
      const {
        title
      } = detail;
      const basePath = this.addFileItem.getParentPath();
      const path = basePath === '/' ? title : basePath + title;
      const els = this.elements;
      const {
        on,
        dispatch,
        handleChange
      } = this.props;
      const handleSelect = this.handleSelect;
      this.props.handleEdit('newFile', item, detail).then(() => {
        const itemContainer = createDiv('fbv-tree-item');
        const item = new FileItemView(itemContainer, {
          line: path,
          on,
          dispatch,
          handleChange,
          handleSelect
        });
        els.items[item.path] = itemContainer;
        this.items[item.path] = item;
        const parentPath = item.getParentPath();

        if (parentPath === '/') {
          this.addRootItem(item);
        } else {
          this.items[parentPath].addChild(item);
        }
      });
      this.hideEditor();
    });

    _defineProperty(this, "handleSelect", item => {
      this.hideEditor();

      if (this.selectedItem) {
        this.selectedItem.unselect();
      }

      item.select();
      this.selectedItem = item;
      this.props.dispatch('select', {
        item
      });
    });

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
    return this.props.options.value.split('\n').map(line => line.trim()).filter(line => line !== '');
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
      handleEditCancel: this.hideEditor
    });

    if (basePath === '/') {
      const container = this.elements.container;
      container.insertBefore(itemContainer, container.firstChild);
    } else {
      const baseItem = this.items[basePath];
      baseItem.expand();
      baseItem.insertTempChild(itemContainer);
    }

    this.addFileItem.focusInput();
  }

  showAddDir() {}

  showEdit() {}

  showRemove() {}

  addDir() {}

  editItem() {}

  removeItem() {}

  // Draw DOM elements in the target element.
  draw() {
    const {
      on,
      dispatch,
      handleChange // handleSelect,

    } = this.props;
    const handleSelect = this.handleSelect;
    const els = this.elements;
    els.container = createDiv('fbv-tree-container');
    els.items = {}; // Create all required FileItemView instances. 

    for (const line of this.getValueLines()) {
      const itemContainer = createDiv('fbv-tree-item');
      const item = new FileItemView(itemContainer, {
        line,
        on,
        dispatch,
        handleChange,
        handleSelect
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
            handleSelect
          });
          els.items[ancestor.path] = ancestorContainer;
          this.items[ancestor.path] = ancestor;
        }
      }
    } // Sort items.


    this.paths = Object.keys(this.items);
    this.paths.sort((a, b) => a > b ? 1 : -1); // Set hierarchy between items.

    for (const path of this.paths) {
      const item = this.items[path];
      const parentPath = item.getParentPath();

      if (parentPath === '/') {
        this.rootItems.push(item);
      } else {
        this.items[parentPath].appendChild(item);
      } // TODO: Sort!

    } // Draw root items.


    for (const item of this.rootItems) {
      els.container.appendChild(item.target);
    }

    this.target.appendChild(els.container);
  }

}

var css$2 = ".fbv-toolbar-container {\n  display: flex;\n  padding: 0 0.25rem;\n  flex-flow: row wrap;\n}\n\n.fbv-toolbar-item {\n  flex: 0 0 auto;\n  padding: 0.25rem 0.25rem;\n  font-size: 1rem;\n  cursor: pointer;\n}\n\n.fbv-toolbar-item:disabled {\n  cursor: not-allowed;\n}\n";
styleInject(css$2);

class ToolbarView {
  constructor(target, props) {
    _defineProperty(this, "handleClick", mode => {
      this.props.handleEditModeChange(mode);
    });

    this.target = target;
    this.props = props;
    this.elements = {};
    this.draw();
  }

  draw() {
    // Create and structure elements.
    const els = this.elements;
    els.container = createDiv('fbv-toolbar-container');
    els.newFile = createAnchor('fbv-toolbar-item fbv-text');
    els.container.appendChild(els.newFile);
    els.newDir = createAnchor('fbv-toolbar-item fbv-text');
    els.container.appendChild(els.newDir);
    els.rename = createAnchor('fbv-toolbar-item fbv-text');
    els.container.appendChild(els.rename);
    els.remove = createAnchor('fbv-toolbar-item fbv-text');
    els.container.appendChild(els.remove); // Set attrubutes & values.

    els.newFile.appendChild(createIcon('fa fa-file'));
    els.newDir.appendChild(createIcon('fa fa-folder'));
    els.rename.appendChild(createIcon('fa fa-pencil'));
    els.remove.appendChild(createIcon('fa fa-trash')); // Bind listeners.

    els.newFile.addEventListener('click', () => this.handleClick('newFile'));
    els.newDir.addEventListener('click', () => this.handleClick('newDir'));
    els.rename.addEventListener('click', () => this.handleClick('rename'));
    els.remove.addEventListener('click', () => this.handleClick('remove'));
    this.target.innerHTML = '';
    this.target.appendChild(els.container);
  }

}

var css$3 = "[class*='fbv-'] {\n  box-sizing: border-box;\n}\n\n.fbv-container {\n  display: flex;\n  flex-flow: column nowrap;\n  position: relative;\n  width: 100%;\n  height: 100%;\n  font-size: 0.875rem;\n  line-height: 1.125rem;\n}\n\n.fbv-header {\n  flex: 0 0 auto;\n  position: relative;\n}\n\n.fbv-body-container {\n  flex: 1 1 auto;\n  position: relative;\n}\n\n.fbv-body {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n}\n";
styleInject(css$3);

var css$4 = ".fbv-container.t-default-light .fbv-text {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-container {\n  background-color: #eee;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item {\n  color: #666;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item:hover {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item:disabled {\n  color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item:disabled:hover {\n  color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-item-row-container:hover {\n  background-color: #ddd;\n}\n\n.fbv-container.t-default-light .fbv-item-row-container--active {\n  background-color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-item-icon {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-item-input {\n  border-color: #999;\n  background-color: #eee;\n  color: #222;\n}";
styleInject(css$4);

const DEFAULT_OPTIONS = {
  theme: 'default-light',
  createFile: true,
  createDir: true,
  rename: true,
  remove: true
};
class FileBrowserView {
  constructor(target, options = {}) {
    _defineProperty(this, "on", (type, listener) => {
      this.eventTarget.addEventListener(type, listener);
    });

    _defineProperty(this, "dispatch", (typeArg, eventInit) => {
      const event = new Event(typeArg, eventInit);
      return this.eventTarget.dispatchEvent(event);
    });

    _defineProperty(this, "handleChange", item => {
      this.dispatch('change', {
        item
      });
    });

    _defineProperty(this, "handleEditModeChange", editMode => {
      switch (editMode) {
        case 'newFile':
          this.fileTreeView.showAddFile();
          break;

        case 'newDir':
          this.fileTreeView.showAddDir();
          break;

        case 'rename':
          this.fileTreeView.showEdit();
          break;

        case 'remove':
          this.fileTreeView.showRemove();
          break;

        default:
          break;
      }
    });

    _defineProperty(this, "confirmEdit", (editMode, editTarget, detail) => {
      const methods = {};
      const promise = new Promise((resolve, reject) => {
        methods.resolve = () => resolve();

        this.dispatch(editMode, {
          cancel: () => reject(),
          ...detail
        });
      });
      setTimeout(() => methods.resolve(), 0);
      return promise;
    });

    _defineProperty(this, "handleEdit", (editMode, editTarget, detail) => {
      return this.confirmEdit(editMode, editTarget, detail);
    });

    this.eventTarget = new EventTarget();
    this.target = target;
    this.options = { ...DEFAULT_OPTIONS,
      ...options
    };
    this.elements = {};
    this.draw();
  }

  getValue() {
    return this.fileTreeView.getValue();
  }

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
    els.bodyContainer.appendChild(els.body); // Bind children.

    const {
      on,
      dispatch,
      options,
      handleChange,
      handleEditModeChange,
      handleEdit
    } = this;
    this.fileTreeView = new FileTreeView(els.body, {
      on,
      dispatch,
      options,
      handleChange,
      handleEdit
    });
    this.toolbarView = new ToolbarView(els.header, {
      handleEditModeChange
    }); // Render.

    this.target.appendChild(els.container);
  }

}

export default FileBrowserView;
