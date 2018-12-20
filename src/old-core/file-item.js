const DEFAULT_OPTIONS = {
  expand: false,
};

export default class FileItem {
  constructor(path, title, options) {
    this.path = path;
    this.title = title;
    this.children = [];
    this.dir = Boolean((options || {}).dir);
    this.options = {
      ...DEFAULT_OPTIONS,
      ...(options || {}),
    };
  }

  splitPath() {
    if (!this.tokens || !this.rawTokens) {
      this.tokens = this.path.split('/');
      this.rawTokens = this.tokens.slice(0, this.tokens.length - (this.dir ? 1 : 0));
    }
  }

  isExpand() {
    return Boolean(this.options.expand);
  }

  getDepth() {
    this.splitPath();
    return this.rawTokens.length - 1;
  }

  getParentPath() {
    this.splitPath();
    return this.rawTokens.slice(0, this.rawTokens.length - 1).join('/') + '/';
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
    const params = Object.keys(this.options)
      .filter(key => !['expand', 'dir'].includes(key))
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.options[key])}`)
      .join('&');
    const expand = this.options.expand ? '*' : '';
    const separator = params ? '?' : '';
    return `${this.path}${expand}${separator}${params}`;
  }
}
