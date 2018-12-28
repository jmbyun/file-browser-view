import { createDiv, createAnchor, createIcon } from './drawer';
import './toast-view.css';

export default class ToastView {
  constructor(target, props) {
    this.target = target;
    this.props = props;

    this.elements = {};
    this.draw();
  }

  remove() {
    this.target.removeChild(this.elements.container);
  }

  drawButtons() {
    const {
      handleOk,
      handleCancel,
    } = this.props;
    const els = this.elements;
    if (handleOk) {
      els.okButton = createAnchor('fbv-toast-button');
      els.okButton.addEventListener('click', () => handleOk());
      els.okButton.appendChild(createIcon('fa fa-check'));
      els.container.appendChild(els.okButton);
    }
    if (handleCancel) {
      els.cancelButton = createAnchor('fbv-toast-button');
      els.cancelButton.addEventListener('click', () => handleCancel());
      els.cancelButton.appendChild(createIcon('fa fa-times'));
      els.container.appendChild(els.cancelButton);
    }
  }

  // Draw DOM elements in the target element.
  draw() {
    // Create and structure elements.
    const { message } = this.props;
    const els = this.elements;
    els.container = createDiv('fbv-toast-container');
    els.message = createDiv('fbv-toast-message');
    els.message.innerHTML = message;
    els.container.appendChild(els.message);
    this.drawButtons();
    
    this.target.appendChild(els.container);
  }
}