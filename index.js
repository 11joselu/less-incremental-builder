const chokidar = require('chokidar');
const argv = require('yargs').argv;

const logger = require('./lib/logger');
const GraphStructure = require('./lib/graph/GraphStructure');
const LessRenderer = require('./lib/compiler/LessRenderer');
const FileManager = require('./lib/compiler/FileManager');
const WatcherQueue = require('./lib/Watcher/WatcherQueue');
const Compiler = require('./lib/compiler/Compiler');
const utils = require('./lib/utils-functions');
const validateArguments = require('./lib/validator/paramsValidator');
const path = require('path');
const cwd = process.cwd();

let config = {};

if (argv.config) {
  if (argv.input || argv.output) {
    logger.warnInfo(
      '`input` or `output` argument will be override by config file options'
    );
  }

  config = require(path.resolve(argv.config));
  argv.src = config.src;
  argv.output = config.output;
}

validateArguments(argv.src, argv.output);
const manager = new FileManager(argv.src, argv.output, cwd);

if (!utils.existsDirectory(manager.getOutputDir())) {
  utils.mkdirp(manager.getOutputDir());
}

const graph = new GraphStructure(manager);
const lessRenderer = new LessRenderer(
  manager,
  graph.getFoundedPaths(),
  config.lessOptions
);

const filesToWatch = graph.getFiles();
const watcher = chokidar.watch(filesToWatch);
const wQueue = new WatcherQueue(filesToWatch, watcher);
const compiler = new Compiler(graph, wQueue, lessRenderer);

function callBuildSuccess(compilePromise) {
  compilePromise.then(buildResult => {
    if (typeof config.onBuildSuccess === 'function') {
      config.onBuildSuccess(buildResult);
    }
  });
}

watcher
  .on('add', filePath => {
    const isMain = manager.isMainFile(filePath);
    if (isMain) {
      const compilePromise = compiler.compile(filePath, isMain);
      callBuildSuccess(compilePromise);
    }
  })
  .on('change', filePath => {
    const isMain = manager.isMainFile(filePath);

    const compilePromise = compiler.compile(filePath, isMain);
    callBuildSuccess(compilePromise);
  })
  .on('unlink', filePath => {
    compiler.unwatchFile(filePath);
  });
