const sassGraph = require('sass-graph');

const loadGraph = file =>
  sassGraph.parseFile(file, {
    extensions: ['less'],
  });

module.exports = loadGraph;
