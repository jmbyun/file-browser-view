export function createElement(tag, className, style) {
  const element = document.createElement(tag);
  element.className = className;
  Object.keys(style || {}).forEach(key => {
    element.style[key] = style[key];
  });
  return element;
}

export function createDiv(className, style) {
  return createElement('div', className, style);
}

export function createIcon(className, style) {
  return createElement('i', className, style);
}

export function createAnchor(className, style) {
  return createElement('a', className, style);
}