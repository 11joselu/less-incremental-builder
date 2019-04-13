const less = require('less');
const hashPlugin = require('../lessPlugin/hashPlugin');

class Renderer {
  constructor(fileManager, paths) {
    this.paths = paths;
    this.manager = fileManager;
    this.lessPlugins = [
      hashPlugin(this.manager.getMap(), this.manager.getCwd()),
    ];
  }

  render(styles) {
    return less.render(styles, {
      paths: this.paths,
      plugins: this.lessPlugins,
    });
  }

  pushNewPath(path) {
    if (!this.paths.includes(path)) {
      this.paths.push(path);
    }
  }

  getPaths() {
    return this.paths;
  }

  getLessPlugin() {
    return this.lessPlugins;
  }

  getManager() {
    return this.manager;
  }
}

module.exports = Renderer;
