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

var css = ".fbv-item-container {\n  padding: 0;\n}\n\n.fbv-item-row-container {\n  padding: 0 0.5rem;\n}\n\n.fbv-item-row {\n  display: flex;\n  align-items: center;\n  flex-flow: row nowrap;\n  padding-top: 0.1rem;\n  padding-bottom: 0.1rem;\n  cursor: pointer;\n}\n\n.fbv-item-icon {\n  flex: 0 0 auto;\n  min-width: 1.25rem;\n  padding-right: 0.5rem;\n  font-size: 0.8rem;\n}\n\n.fbv-item-title {\n  flex: 1 1 auto;\n}\n\n.fbv-item-children {\n\n}";
styleInject(css);

const INDENT_SIZE = 0.5;
class FileItemView {
  constructor(target, props) {
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

  addChild(child) {
    this.children.push(child);
    this.elements.children.appendChild(child.target);
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
    this.props.dispatch('expand', {
      item: this
    });
    this.updateLine();
    this.props.handleChange(this);
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

    if (this.options.dir) {
      if (this.options.expand) {
        els.icon = createIcon('fa fa-angle-down');
      } else {
        els.icon = createIcon('fa fa-angle-right');
      }
    } else {
      els.icon = createIcon('fa fa-file');
    }
  } // Draw DOM elements in the target element.


  draw() {
    // Create and structure elements.
    this.drawIcon();
    const els = this.elements;
    els.container = createDiv('fbv-item-container');
    els.rowContainer = createDiv('fbv-item-row-container');
    els.container.appendChild(els.rowContainer);
    els.row = createDiv('fbv-item-row');
    els.rowContainer.appendChild(els.row);
    els.iconContainer = createDiv('fbv-item-icon');
    els.row.appendChild(els.iconContainer);
    els.iconContainer.appendChild(els.icon);
    els.title = createDiv('fbv-item-title');
    els.title.innerHTML = this.title;
    els.row.appendChild(els.title);
    els.children = createDiv('fbv-item-children');
    els.container.appendChild(els.children); // Set padding left according to the depth of the item.

    const depth = this.pathTokens.length - 1;
    els.row.style.paddingLeft = `${depth * INDENT_SIZE}rem`; // Set visibility of the children.

    if (!this.options.expand) {
      els.children.style.display = 'none';
    } // Bind listeners to elements.


    els.row.addEventListener('click', e => this.handleClickRow(e));
    this.target.appendChild(els.container);
  }

}

var css$1 = ".fbv-tree-container {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow-y: auto;\n}\n\n.fbv-tree-item {\n  display: block;\n}";
styleInject(css$1);

class FileTreeView {
  constructor(target, props) {
    this.target = target;
    this.props = props;
    this.paths = [];
    this.rootItems = [];
    this.elements = {};
    this.draw();
  }

  getValueLines() {
    return this.props.options.value.split('\n').map(line => line.trim()).filter(line => line !== '');
  } // Draw DOM elements in the target element.


  draw() {
    const {
      on,
      dispatch,
      items,
      options,
      handleChange,
      handleSelect,
      handleEdit
    } = this.props;
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
      this.props.items[item.path] = item;

      for (const ancestorPath of item.getAncestorPaths()) {
        if (!this.props.items[ancestorPath]) {
          const ancestorContainer = createDiv('fbv-tree-item');
          const ancestor = new FileItemView(ancestorContainer, {
            line: ancestorPath,
            on,
            dispatch,
            handleChange,
            handleSelect
          });
          els.items[ancestor.path] = ancestorContainer;
          this.props.items[ancestor.path] = ancestor;
        }
      }
    } // Sort items.


    this.paths = Object.keys(this.props.items);
    this.paths.sort((a, b) => a > b ? 1 : -1); // Set hierarchy between items.

    for (const path of this.paths) {
      const item = this.props.items[path];
      const parentPath = item.getParentPath();

      if (parentPath === '/') {
        this.rootItems.push(item);
      } else {
        this.props.items[parentPath].addChild(item);
      }
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
    const remove = createAnchor('fbv-toolbar-item fbv-text'); // Set up the structure.

    container.appendChild(newFile);
    container.appendChild(newDir);
    container.appendChild(rename);
    container.appendChild(remove); // Set attrubutes & values.

    newFile.appendChild(createIcon('fa fa-file'));
    newDir.appendChild(createIcon('fa fa-folder'));
    rename.appendChild(createIcon('fa fa-pencil'));
    remove.appendChild(createIcon('fa fa-trash')); // Bind listeners.
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
      remove
    };
  }

  drawElements() {
    this.target.innerHTML = '';
    this.createLayout();
    this.target.appendChild(this.elements.container);
  }

}

var css$3 = "[class*='fbv-'] {\n  box-sizing: border-box;\n}\n\n.fbv-container {\n  display: flex;\n  flex-flow: column nowrap;\n  position: relative;\n  width: 100%;\n  height: 100%;\n  font-size: 0.875rem;\n  line-height: 1.125rem;\n}\n\n.fbv-header {\n  flex: 0 0 auto;\n  position: relative;\n}\n\n.fbv-body-container {\n  flex: 1 1 auto;\n  position: relative;\n}\n\n.fbv-body {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n}\n";
styleInject(css$3);

var css$4 = ".fbv-container.t-default-light .fbv-text {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-container {\n  background-color: #eee;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item {\n  color: #666;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item:hover {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item:disabled {\n  color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item:disabled:hover {\n  color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-item-row-container:hover {\n  background-color: #ddd;\n}\n\n.fbv-container.t-default-light .fbv-item-row-container--active {\n  background-color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-item-icon {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-tree-input {\n  border-color: #999;\n  background-color: #eee;\n}";
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

    _defineProperty(this, "handleSelect", item => {
      if (this.selectedItem) {
        this.selectedItem.unselect();
      }

      item.select();
      this.selectedItem = item;
      this.dispatch('select', {
        item
      });
    });

    _defineProperty(this, "handleEdit", (editMode, editTarget) => {});

    this.eventTarget = new EventTarget();
    this.target = target;
    this.options = { ...DEFAULT_OPTIONS,
      ...options
    };
    this.selectedItem = null;
    this.editMode = null;
    this.editTarget = null;
    this.items = {};
    this.elements = {};
    this.draw();
  }

  getValue() {
    const paths = Object.keys(this.items);
    paths.sort((a, b) => a > b ? 1 : -1);
    return paths.map(p => this.items[p].line).join('\n');
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
      items,
      options,
      handleChange,
      handleSelect,
      handleEdit
    } = this;
    this.fileTreeView = new FileTreeView(els.body, {
      on,
      dispatch,
      items,
      options,
      handleChange,
      handleSelect,
      handleEdit
    });
    this.toolbarView = new ToolbarView(els.header, {}); // Render.

    this.target.appendChild(els.container);
  }

}

export default FileBrowserView;
