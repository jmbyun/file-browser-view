'use strict';

class Files {
  constructor(target, options) {
    this.target = target;
    this.options = options;
    this.render();
  }

  render() {}

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

var css = ".fbv-container {\n  display: flex;\n  position: relative;\n  width: 100%;\n  height: 100%;\n}\n\n.fbv-header {\n  flex: 0 0 auto;\n  position: relative;\n}\n\n.fbv-body-container {\n  flex: 1 1 auto;\n  position: relative;\n}\n\n.fbv-body {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n}\n";
styleInject(css);

const DEFAULT_OPTIONS = {};
class FileBrowserView {
  constructor(target, options = {}) {
    this.target = target;
    this.options = { ...DEFAULT_OPTIONS,
      ...options
    };
    this.render();
  }

  createElement(className) {
    const element = document.createElement('div');
    element.className = className;
    return element;
  }

  createLayout() {
    const container = this.createElement('fbv-container');
    const header = this.createElement('fbv-header');
    const bodyContainer = this.createElement('fbv-body-container');
    const body = this.createElement('fbv-body');
    container.appendChild(header);
    container.appendChild(bodyContainer);
    bodyContainer.appendChild(body);
    this.header = header;
    this.body = body;
    return container;
  }

  render() {
    const layout = this.createLayout();
    this.files = new Files(this.body, { ...this.options,
      depth: 0
    });
    this.target.appendChild(layout);
  }

}

module.exports = FileBrowserView;
