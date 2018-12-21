import { createDiv, createAnchor, createIcon } from './drawer';
import './toolbar-view.css';

export default class ToolbarView {
  constructor(target, props) {
    this.target = target;
    this.props = props;
    
    this.elements = {};
    this.draw();
  }

  handleClick = mode => {
    this.props.handleEditModeChange(mode);
  };

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
    els.container.appendChild(els.remove);

    // Set attrubutes & values.
    els.newFile.appendChild(createIcon('fa fa-file'));
    els.newDir.appendChild(createIcon('fa fa-folder'));
    els.rename.appendChild(createIcon('fa fa-pencil'));
    els.remove.appendChild(createIcon('fa fa-trash'));

    // Bind listeners.

    els.newFile.addEventListener('click', () => this.handleClick('newFile'));
    els.newDir.addEventListener('click', () => this.handleClick('newDir'));
    els.rename.addEventListener('click', () => this.handleClick('rename'));
    els.remove.addEventListener('click', () => this.handleClick('remove'));

    this.target.innerHTML = '';
    this.target.appendChild(els.container);
  }
}