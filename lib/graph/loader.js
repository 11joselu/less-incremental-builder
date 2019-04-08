const sassGraph = require("sass-graph");

exports.loadGraph = (file) => sassGraph.parseFile(file, {
  extensions: ["less"]
});
