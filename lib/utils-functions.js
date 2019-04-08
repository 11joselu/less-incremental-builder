const fs = require('fs');
const path = require('path');

exports.mkdirp = (filepath) => {
  var dirname = path.dirname(filepath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, {
      recursive: true
    });
  }
}

exports.getPathsFromGraph = (graph, cwd, mainFile) => {
  const paths = graph.foundedPaths.map(p => path.relative(cwd, p) + '/');

  if (!paths.length) {
    paths.push(path, path.dirname(mainFile));
  }

  return paths;
}
