
export function createElement(tag, className, style) {
  const element = document.createElement(tag);
  element.className = className;
  Object.keys(style || {}).forEach(key => {
    element.style[key] = style[key];
  });
  return element;
}