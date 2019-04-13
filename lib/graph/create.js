const sassGraph = require('sass-graph');

const createGraph = file =>
  sassGraph.parseFile(file, {
    extensions: ['less'],
  });

module.exports = createGraph;
