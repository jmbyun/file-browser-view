'use strict';

function createElement(tag, className, style) {
  const element = document.createElement(tag);
  element.className = className;
  Object.keys(style || {}).forEach(key => {
    element.style[key] = style[key];
  });
  return element;
}

const DEFAULT_OPTIONS = {};

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

  addChildren(...children) {
    this.children.push(...children);
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

var css = ".fbv-tree-container {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  overflow-y: auto;\n}\n\n.fbv-tree-item-container {\n\n}\n\n.fbv-tree-item-row {\n  display: flex;\n  flex-flow: row nowrap;\n}\n\n.fbv-tree-item-icon {\n  flex: 0 0 auto;\n}\n.fbv-tree-item-title {\n  flex: 1 1 auto;\n}\n.fbv-tree-item-info {\n  flex: 0 0 auto;\n}\n\n.fbv-tree-item-children {\n\n}";
styleInject(css);

class FileTreeView {
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
    const row = createElement('div', 'fbv-tree-item-row', {
      paddingLeft
    });
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
      children
    };
  }

  drawElements() {
    this.createLayout();

    for (const item of this.fileTree.rootItems) {
      this.createItem(item, this.elements.container, 0);
    }

    this.target.appendChild(this.elements.container);
  }

}

var css$1 = ".fbv-container {\n  display: flex;\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n.fbv-header {\n  flex: 0 0 auto;\n  position: relative;\n}\n\n.fbv-body-container {\n  flex: 1 1 auto;\n  position: relative;\n}\n\n.fbv-body {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n}\n";
styleInject(css$1);

const DEFAULT_OPTIONS$1 = {
  indentSize: 16
};
class FileBrowserView {
  constructor(target, options = {}) {
    this.target = target;
    this.options = { ...DEFAULT_OPTIONS$1,
      ...options
    };
    this.elements = {};
    this.drawElements();
  }

  createLayout() {
    const container = createElement('div', 'fbv-container');
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
    this.fileTreeView = new FileTreeView(this.elements.body, this.options);
    this.target.appendChild(this.elements.container);
  }

}

module.exports = FileBrowserView;
