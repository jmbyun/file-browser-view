
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.FileBrowserView = factory());
}(this, (function () { 'use strict';

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

  var css = ".fbv-item-container {\n  padding: 0 0.5rem;\n}\n\n.fbv-item-row {\n  display: flex;\n  align-items: center;\n  flex-flow: row nowrap;\n  padding-top: 0.1rem;\n  padding-bottom: 0.1rem;\n  cursor: pointer;\n}\n\n.fbv-item-icon {\n  flex: 0 0 auto;\n  min-width: 1.25rem;\n  padding-right: 0.5rem;\n  font-size: 0.8rem;\n}\n\n.fbv-item-title {\n  flex: 1 1 auto;\n}\n\n.fbv-item-children {\n\n}";
  styleInject(css);

  class FileItemView {
    constructor(target, line) {
      const lineTokens = line.split('?');
      this.target = target;
      this.line = line;
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
      this.drawIcon();
      const els = this.elements;
      els.container = createDiv('fbv-item-container');
      els.row = createDiv('fbv-item-row');
      els.container.appendChild(els.row);
      els.iconContainer = createDiv('fbv-item-icon');
      els.row.appendChild(els.iconContainer);
      els.iconContainer.appendChild(els.icon);
      els.title = createDiv('fbv-item-title');
      els.title.innerHTML = this.title;
      els.row.appendChild(els.title);
      els.children = createDiv('fbv-item-children');
      els.container.appendChild(els.children);
      const depth = this.pathTokens.length - 1;
      els.row.style.paddingLeft = `${depth}rem`;

      if (!this.options.expand) {
        els.children.style.display = 'none';
      }

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
      const els = this.elements;
      els.container = createDiv('fbv-tree-container');
      els.items = {}; // Create all required FileItemView instances. 

      for (const line of this.getValueLines()) {
        const itemContainer = createDiv('fbv-tree-item');
        const item = new FileItemView(itemContainer, line);
        els.items[item.path] = itemContainer;
        this.props.items[item.path] = item;

        for (const ancestorPath of item.getAncestorPaths()) {
          if (!this.props.items[ancestorPath]) {
            const ancestorContainer = createDiv('fbv-tree-item');
            const ancestor = new FileItemView(ancestorContainer, ancestorPath);
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

  var css$4 = ".fbv-container.t-default-light .fbv-text {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-container {\n  background-color: #eee;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item {\n  color: #666;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item:hover {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item:disabled {\n  color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-toolbar-item:disabled:hover {\n  color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-item-container:hover {\n  background-color: #ddd;\n}\n\n.fbv-container.t-default-light .fbv-item-container--active {\n  background-color: #ccc;\n}\n\n.fbv-container.t-default-light .fbv-item-icon {\n  color: #222;\n}\n\n.fbv-container.t-default-light .fbv-tree-input {\n  border-color: #999;\n  background-color: #eee;\n}";
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

    on(type, listener) {
      this.eventTarget.addEventListener(type, listener);
    }

    handleSelect(item) {}

    handleEdit(editMode, editTarget) {} // Draw DOM elements in the target element.


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

      this.fileTreeView = new FileTreeView(els.body, {
        eventTarget: this.eventTarget,
        items: this.items,
        options: this.options,
        handleSelect: item => this.handleSelect(item),
        handleEdit: (editMode, editTarget) => this.handleEdit(editMode, editTarget)
      });
      this.toolbarView = new ToolbarView(els.header, {}); // Render.

      this.target.appendChild(els.container);
    }

  }

  return FileBrowserView;

})));
