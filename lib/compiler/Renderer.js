const less = require('less');
const hashPlugin = require('../lessPlugin/hashPlugin');

class Renderder {
  constructor(paths, cwd) {
    this.paths = paths;
    this.cwd = cwd;
    this.map = new Map();
    this.lessPlugins = [hashPlugin(this.map, this.cwd)];
  }

  render(styles) {
    return less.render(styles, {
      paths: this.paths,
      plugins: this.lessPlugins
    })
  }

  getFileHash(key) {
    return this.map.get(key);
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
}

module.exports = Renderder;
