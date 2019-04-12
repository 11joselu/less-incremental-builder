const Hasher = require('./Hasher');

module.exports = (map, cwd = '') => {
  return {
    install: function (less, pluginManager) {
      pluginManager.addPreProcessor(new Hasher(cwd, map));
    },
  };
};
