const sassGraph = require('sass-graph');

const createGraph = file =>
  sassGraph.parseFile(file, {
    extensions: ['less', 'css'],
  });

module.exports = createGraph;
