import { createDiv, createIcon } from './drawer';
import './file-item-view.css';

const INDENT_SIZE = 0.5;

export default class FileItemView {
  constructor(target, props) {
    const lineTokens = props.line.split('?');
    this.target = target;
    this.props = props;
    this.line = props.line;
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

  updateLine() {
    const params = Object.keys(this.options)
      .filter(key => !['expand', 'dir'].includes(key))
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.options[key])}`)
      .join('&');
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
    this.props.dispatch('expand', { item: this });
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
  }

  // Draw DOM elements in the target element.
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
    els.container.appendChild(els.children);

    // Set padding left according to the depth of the item.
    const depth = this.pathTokens.length - 1;
    els.row.style.paddingLeft = `${depth * INDENT_SIZE}rem`;

    // Set visibility of the children.
    if (!this.options.expand) {
      els.children.style.display = 'none';
    }

    // Bind listeners to elements.
    els.row.addEventListener('click', e => this.handleClickRow(e));
    
    this.target.appendChild(els.container);
  }
}