const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const DirectoryAlreadyExistsException = require('./exceptions/DirectoryAlreadyExistsException');

exports.mkdirp = (dirname) => {

  if (this.existsDirectory(dirname)) {
    throw new DirectoryAlreadyExistsException(dirname);
  }

  fs.mkdirSync(dirname, {
    recursive: true
  });

  return true;
}

exports.existsDirectory = (dirname) => {
  return fs.existsSync(dirname)
}

exports.getPathsForLessPlugin = (graph, cwd, mainFile) => {
  const paths = graph.foundedPaths.map(p => path.relative(cwd, p) + '/');

  if (!paths.length) {
    paths.push(path, path.dirname(mainFile));
  }

  return paths;
}

exports.hash = (string) => crypto.createHash('md5').update(string).digest('hex');
