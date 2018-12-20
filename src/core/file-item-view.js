import { createDiv, createIcon } from './drawer';
import './file-item-view.css';

export default class FileItemView {
  constructor(target, line) {
    const lineTokens = line.split('?');
    this.target = target;
    this.line = line;
    this.path = lineTokens[0].replace('*', '').trim();
    this.options = {
      expand: lineTokens[0].endsWith('*'),
      dir: this.path.endsWith('/'),
      ...(lineTokens.length > 1 ? this.parseOptions(lineTokens[1]) : {}),
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
  }

  // Draw DOM elements in the target element.
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