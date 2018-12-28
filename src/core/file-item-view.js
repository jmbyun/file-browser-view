import { createDiv, createElement, createIcon } from './drawer';
import './file-item-view.css';

const INDENT_SIZE = 0.5;
const ENTER_KEY_CODE = 13;
const ESC_KEY_CODE = 27;

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

  isDir() {
    return this.options.dir;
  }

  isEdit() {
    const { newFile, newDir, rename } = this.options;
    return newFile || newDir || rename;
  }

  updateLine() {
    const params = Object.keys(this.options)
      .filter(key => !['expand', 'dir'].includes(key))
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.options[key])}`)
      .join('&');
    const expand = this.options.expand ? '*' : '';
    const separator = params ? '?' : '';
    this.line = `${this.path}${expand}${separator}${params}`;
    this.pathTokens = this.path.split('/').filter(p => p !== '');
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
      els.children.insertBefore(child.target, items[index + 1].target);
    }
  }

  removeChild(child) {
    const els = this.elements;
    const index = this.children.indexOf(child);
    this.children.splice(index, 1);
    els.children.removeChild(child.target);
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

  showRename(props) {
    this.options.rename = true;
    Object.assign(this.props, props);
    this.updateLine();
    this.drawMainItem();
  }

  cancelRename() {
    delete this.options['rename'];
    this.updateLine();
    this.drawMainItem();
  }

  rename(title) {
    delete this.options['rename'];
    this.title = title;
    this.path = [
      this.getParentPath(),
      title,
      this.options.dir ? '/' : '',
    ].join('');
    this.updateLine();
    this.drawMainItem();
    this.props.handleChange(this);
  }

  remove() {
    this.target.removeChild(this.elements.container);
  }

  focusInput = () => {
    this.elements.input.focus();
  };

  handleClickRow(e) {
    if (this.options.rename) {
      return;
    }
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
    const { newFile, newDir, dir, expand } = this.options;
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
    const { rename } = this.options;
    const els = this.elements;
    els.main.innerHTML = '';
    if (this.isEdit()) {
      els.input = createElement('input', 'fbv-item-input');
      if (rename) {
        els.input.value = this.title;
      }
      els.input.addEventListener('keyup', e => {
        if (e.keyCode === ENTER_KEY_CODE) {
          this.props.handleEdit(this, { title: els.input.value });
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
  }

  // Draw DOM elements in the target element.
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
    els.container.appendChild(els.children);

    // Set padding left according to the depth of the item.
    const depth = this.pathTokens.length - 1;
    els.row.style.paddingLeft = `${depth * INDENT_SIZE}rem`;

    // Set visibility of the children.
    if (!this.options.expand) {
      els.children.style.display = 'none';
    }

    // Bind listeners to elements.
    if (!this.isEdit()) {
      els.row.addEventListener('click', e => this.handleClickRow(e));
    }
    
    this.target.appendChild(els.container);
  }
}