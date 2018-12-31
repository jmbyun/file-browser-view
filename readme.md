# FileBrowserView

FileBrowserView is a file tree implemented in Javascript for the browser. You can browse the directory structure with FileBrowserView and create, rename, move, or remove files and directories from the structure. 

CSS theming system are available for customizing the look of FileBrowserView to fit our application. 

## Basic Usage

The easiest way to use FileBrowserView is to simply load the script under `dist/` in the distribution. For example:

```html
<div id="main"></div>
<script src="dist/file-browser-view.umd.js"></script>
<script>
  var value = '
src/*\
src/core/\
src/core/file-browser-view.js\
src/core/file-browser-view.css\
src/themes/\
src/themes/default-light.css\
src/main.css\
src/main.js\
readme.md\
  ';

  var main = document.getElementById('main');
  var view = new FileBrowserView(main, { value: value });
  view.on('select', function (e) {
    alert('You\'ve selected the file "' + e.detail.path + '"!');
  });
</script>
```

This will render the editor in the element with id `main`, will load the directory structure represented as a string value in the variable `value`. 

After rendering the user interface and loading the file structure, this will bind the listener function so that an alert can be shown to the user when user clicks on any of the files or directories in the file tree.

Please check out `index.html` file to see how to use the library in the browser environment.