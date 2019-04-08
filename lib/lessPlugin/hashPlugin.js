const {
  HashManager
} = require('./HashManager');

const NewPost = function () {}

module.exports = (map, cwd = '') => {
  return {
    install: function (less, pluginManager) {
      pluginManager.addPreProcessor(new HashManager(cwd, map));
    },
  };
}
