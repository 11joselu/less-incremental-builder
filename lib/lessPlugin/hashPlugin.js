const {
  HashManager
} = require('./HashManager');

module.exports = (map, cwd = '') => {
  return {
    install: function (less, pluginManager) {
      pluginManager.addPreProcessor(new HashManager(cwd, map));
    },
  };
}
