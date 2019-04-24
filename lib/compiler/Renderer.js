const less = require('less');
const hashPlugin = require('../lessPlugin/hashPlugin');

class Renderer {
  constructor(fileManager, paths, lessOptions = {}) {
    this.paths = paths;
    this.manager = fileManager;
    this.hasherPlugin = hashPlugin(
      this.manager.getMap(),
      this.manager.getCwd()
    );
    this.lessOptions = this._parseLessOptions(lessOptions);
  }

  _parseLessOptions(lessOptions) {
    const defaultOptions = {
      paths: this.paths,
      plugins: [this.hasherPlugin],
    };
    const options = Object.assign(defaultOptions, lessOptions);

    if (lessOptions.paths) {
      if (!Array.isArray(lessOptions.paths)) {
        this._throwErrorOptionType(lessOptions.paths, 'paths');
      }

      options.paths = this.paths.concat(options.paths);
    }

    if (lessOptions.plugins) {
      if (!Array.isArray(lessOptions.plugins)) {
        this._throwErrorOptionType(lessOptions.plugins, 'paths');
      }

      options.plugins = [].concat(this.hasherPlugin, options.plugins);
    }

    // Do not compress outputfile
    delete options.compress;

    return options;
  }

  _throwErrorOptionType(option, optionName) {
    throw new Error(
      'Less ' +
        optionName +
        ' option should be an Array but a ' +
        typeof option +
        ' given'
    );
  }

  render(styles) {
    return less.render(styles, Object.assign({}, this.lessOptions));
  }

  pushNewPath(path) {
    if (!this.paths.includes(path)) {
      this.paths.push(path);
    }
  }

  getPaths() {
    return this.paths;
  }

  getHasherPlugin() {
    return this.hasherPlugin;
  }

  getManager() {
    return this.manager;
  }

  getLessOptions() {
    return this.lessOptions;
  }
}

module.exports = Renderer;
