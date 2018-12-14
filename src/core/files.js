import { createElement } from './render';
import './files.css';

export default class Files {
  constructor(target, options) {
    this.target = target;
    this.options = options;
    this.elements = {};
    this.filePaths = [];
    this.fileInfoMap = {};
    this.updateValue(options.value);
    this.drawElements();
  }

  updateValue(value) {
    const lines = value.split('\n');
    for (const line of lines) {
      if (line.trim() === '') {
        continue;
      }
      const fileInfo = {};
      const lineTokens = line.split('*');
      const filePath = lineTokens[0].trim();
      const options = line.includes('*') ? lineTokens[1].trim() : '';
      
      fileInfo.dir = filePath.endsWith('/');
      fileInfo.expand = options.includes('e');
      
      const splitPath = filePath.split('/');
      fileInfo.filename = splitPath[splitPath.length - 1] || splitPath[splitPath.length - 2];

      this.filePaths.push(filePath);
      this.fileInfoMap[filePath] = fileInfo;
    }
    this.filePaths.sort();
  }


  createContainer() {
    
  }

  createItem(element, filePath, fileInfo) {
    
  }

  createItems() {
    for (const filePath of this.filePaths) {
      this.createItem(filePath);
    }
  }

  createLayout() {
    this.elements.container = createElement('div', 'fbv-files-container');
    this.elements.itemContainers = {};
    for (const filePath of this.filePaths) {
      const itemContainer = createElement('div', 'fbv-files-file-container');
      this.elements.container.appendChild(itemContainer);
      this.elements.itemContainers[filePath] = itemContainer;
    }
  }

  drawElements() {
    this.createLayout();
    this.createItems();

    this.target.appendChild(container);
  }
}