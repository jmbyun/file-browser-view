import FileItem from './file-item';

export default class FileTree {
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
      const parentPath = pathTokens
        .slice(0, pathTokens.length - (item.dir ? 2 : 1))
        .join('/') + '/';
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
      dir: filePath.endsWith('/'),
    };
    if (lineTokens.length > 1) {
      Object.assign(options, this.parseOptions(lineTokens[1]));
    }

    // Add ancestor directories.
    const pathTokens = filePath.split('/');
    for (let depth = 1; depth < pathTokens.length; depth++) {
      const ancestorPath = pathTokens.slice(0, depth).join('/') + '/';
      if (ancestorPath === filePath || this.items[ancestorPath]) {
        continue;
      }
      this.addItem(
        new FileItem(
          ancestorPath,
          pathTokens[depth - 1],
          { dir: true },
        )
      );
    }
    this.addItem(
      new FileItem(
        filePath,
        pathTokens[pathTokens.length - (options.dir ? 2 : 1)],
        options,
      )
    );
  }

  parseValue(value) {
    const lines = value.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
    for (const line of lines) {
      this.parseValueLine(line);
    }
  }

  toValue() {
    const paths = Object.keys(this.items);
    paths.sort();
    return paths.map(path => this.items[path].toString())
      .join('\n');
  }
}