function createElement(tag, className, style) {
  const element = document.createElement(tag);
  element.className = className;
  Object.keys(style || {}).forEach(key => {
    element.style[key] = style[key];
  });
  return element;
}

const DEFAULT_OPTIONS = {
  expand: false
};
class FileItem {
  constructor(path, title, options) {
    this.path = path;
    this.title = title;
    this.children = [];
    this.dir = Boolean((options || {}).dir);
    this.options = { ...DEFAULT_OPTIONS,
      ...(options || {})
    };
  }

  isExpand() {
    return Boolean(this.options.expand);
  }

  addChildren(...children) {
    this.children.push(...children);
  }

  expand() {
    if (this.dir) {
      this.options.expand = true;
    }
  }

  collapse() {
    if (this.dir) {
      this.options.expand = false;
    }
  }

  toString() {
    const params = Object.keys(this.options).filter(key => !['expand', 'dir'].includes(key)).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.options[key])}`).join('&');
    const expand = this.options.expand ? '*' : '';
    const separator = params ? '?' : '';
    return `${this.path}${expand}${separator}${params}`;
  }

}
class FileTree {
  constructor(value) {
    this.items = {};
    this.rootItems = [];
    this.parseValue(value);
  }

  addItem(item) {
    // Register to all items map.
    this.items[item.path] = item;
    const pathTokens = item.path.split('/');

    if (pathTokens.length === (item.dir ? 2 : 1)) {
      // Register to root items array.
      this.rootItems.push(item);
    } else {
      // Register to parent's children array.
      const parentPath = pathTokens.slice(0, pathTokens.length - (item.dir ? 2 : 1)).join('/') + '/';
      this.items[parentPath].addChildren(item);
    }
  }

  parseOptions(options) {
    const params = {};
    const pairs = options.split('&');

    for (const pair of pairs) {
      if (pair.includes('=')) {
        const pairTokens = pair.trim().split('=');
        params[decodeURIComponent(pairTokens[0])] = decodeURIComponent(pairTokens[1]);
      } else {
        params[decodeURIComponent(pair.trim())] = true;
      }
    }

    return params;
  }

  parseValueLine(line) {
    const lineTokens = line.split('?');
    const filePath = lineTokens[0].replace('*', '').trim();
    const options = {
      expand: lineTokens[0].endsWith('*'),
      dir: filePath.endsWith('/')
    };

    if (lineTokens.length > 1) {
      Object.assign(options, this.parseOptions(lineTokens[1]));
    } // Add ancestor directories.


    const pathTokens = filePath.split('/');

    for (let depth = 1; depth < pathTokens.length; depth++) {
      const ancestorPath = pathTokens.slice(0, depth).join('/') + '/';

      if (ancestorPath === filePath || this.items[ancestorPath]) {
        continue;
      }

      this.addItem(new FileItem(ancestorPath, pathTokens[depth - 1], {
        dir: true
      }));
    }

    this.addItem(new FileItem(filePath, pathTokens[pathTokens.length - (options.dir ? 2 : 1)], options));
  }

  parseValue(value) {
    const lines = value.split('\n').map(line => line.trim()).filter(line => line !== '');

    for (const line of lines) {
      this.parseValueLine(line);
    }
  }

  toValue() {
    const paths = Object.keys(this.items);
    paths.sort();
    return paths.map(path => this.items[path].toString).join('\n');
  }

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

var css = ".fbv-tree-container {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow-y: auto;\n}\n\n.fbv-tree-item-container {\n\n}\n\n.fbv-tree-row-container {\n  padding: 0 0.5rem;\n}\n\n.fbv-tree-item-row {\n  display: flex;\n  flex-flow: row nowrap;\n  padding-top: 0.1rem;\n  padding-bottom: 0.1rem;\n}\n\n.fbv-tree-item-icon {\n  flex: 0 0 auto;\n  min-width: 1.125rem;\n  padding-right: 0.5rem;\n}\n\n.fbv-tree-arrow-down {\n  margin-top: 0.45rem;\n  width: 0; \n  height: 0; \n  border-left: 0.3rem solid transparent;\n  border-right: 0.3rem solid transparent;\n  \n  border-top: 0.3rem solid #000;\n}\n\n.fbv-tree-arrow-right {\n  margin-top: 0.25rem;\n  width: 0; \n  height: 0; \n  border-top: 0.3rem solid transparent;\n  border-bottom: 0.3rem solid transparent;\n  \n  border-left: 0.3rem solid #000;\n}\n\n.fbv-tree-item-title {\n  flex: 1 1 auto;\n}\n\n.fbv-tree-item-info {\n  flex: 0 0 auto;\n}\n\n.fbv-tree-item-children {\n\n}";
styleInject(css);

class FileTreeView {
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
      this.elements.items[this.selectedPath].rowContainer.classList.remove('fbv-tree-row-container--active');
    }

    this.selectedPath = item.path;
    this.elements.items[item.path].rowContainer.classList.add('fbv-tree-row-container--active');
  }

  handleRowClick(item) {
    if (item.dir) {
      if (item.isExpand()) {
        this.collapseItem(item);
        this.dispatch('collapse', {
          path: item.path
        });
      } else {
        this.expandItem(item);
        this.dispatch('expand', {
          path: item.path
        });
      }
    }

    this.dispatch('change', {
      path: item.path,
      options: item.options
    });
    this.selectItem(item);
    this.dispatch('select', {
      path: item.path
    });
  }

  createLayout() {
    this.elements.container = createElement('div', 'fbv-tree-container');
    this.elements.items = {};
  }

  createItem(item, target, depth) {
    const paddingLeft = `${depth * this.options.indentSize * 0.0625}rem`;
    const container = createElement('div', 'fbv-tree-item-container');
    const rowContainer = createElement('div', 'fbv-tree-row-container');
    const row = createElement('div', 'fbv-tree-item-row', {
      paddingLeft
    });
    const children = createElement('div', 'fbv-tree-item-children');
    const icon = createElement('div', 'fbv-tree-item-icon');
    const arrow = createElement('div');
    const title = createElement('div', 'fbv-tree-item-title fbv-text');
    const info = createElement('div', 'fbv-tree-item-info'); // Setup the structure.

    if (item.dir) {
      icon.appendChild(arrow);
    }

    row.appendChild(icon);
    row.appendChild(title);
    row.appendChild(info);
    rowContainer.appendChild(row);
    container.appendChild(rowContainer);
    container.appendChild(children);
    target.appendChild(container); // Set attributes & values.

    title.innerHTML = item.title;
    row.style.cursor = 'pointer';

    if (item.isExpand()) {
      arrow.className = 'fbv-tree-arrow-down';
    } else {
      arrow.className = 'fbv-tree-arrow-right';
      children.style.display = 'none';
    } // Bind listeners.


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
      children
    };
  }

  drawElements() {
    this.target.innerHTML = '';
    this.createLayout();

    for (const item of this.fileTree.rootItems) {
      this.createItem(item, this.elements.container, 0);
    }

    this.target.appendChild(this.elements.container);
  }

}

var css$1 = "[class*='fbv-'] {\n  box-sizing: border-box;\n}\n\n.fbv-container {\n  display: flex;\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n.fbv-header {\n  flex: 0 0 auto;\n  position: relative;\n}\n\n.fbv-body-container {\n  flex: 1 1 auto;\n  position: relative;\n}\n\n.fbv-body {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n}\n";
styleInject(css$1);

var css$2 = ".fbv-container.t-default-light .fbv-text {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-tree-row-container:hover {\n  background-color: #ddd;\n}\n\n.fbv-container.t-default-light .fbv-tree-row-container--active {\n  background-color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-tree-arrow-down {\n  border-top-color: #222;\n}\n\n.fbv-container.t-default-light .fbv-tree-arrow-right {\n  border-left-color: #222;\n}\n\n";
styleInject(css$2);

const DEFAULT_OPTIONS$1 = {
  indentSize: 16,
  theme: 'default-light'
};
class FileBrowserView extends EventTarget {
  constructor(target, options = {}) {
    super();
    this.target = target;
    this.options = { ...DEFAULT_OPTIONS$1,
      ...options
    };
    this.elements = {};
    this.drawElements();
  }

  on(typeArg, listener) {
    this.addEventListener(typeArg, listener);
  }

  off(typeArg, listener) {
    this.removeEventListener(typeArg, listener);
  }

  getValue() {
    return this.fileTreeView.getValue();
  }

  setOption(key, value) {
    this.options[key] = value;

    switch (key) {
      case 'value':
        this.fileTreeView.setValue(value);
        break;

      default:
        break;
    }
  }

  dispatch(typeArg, eventInit) {
    const event = new Event(typeArg, eventInit);
    return this.dispatchEvent(event);
  }

  createLayout() {
    const container = createElement('div', `fbv-container t-${this.options.theme}`);
    const header = createElement('div', 'fbv-header');
    const bodyContainer = createElement('div', 'fbv-body-container');
    const body = createElement('div', 'fbv-body');
    container.appendChild(header);
    container.appendChild(bodyContainer);
    bodyContainer.appendChild(body);
    this.elements.header = header;
    this.elements.body = body;
    this.elements.container = container;
  }

  drawElements() {
    this.createLayout();
    this.fileTreeView = new FileTreeView(this, this.elements.body, this.options);
    this.target.appendChild(this.elements.container);
  }

}

export default FileBrowserView;
