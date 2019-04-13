const chokidar = require('chokidar');
const vfs = require('vinyl-fs');
const fs = require('fs');
const through = require('through2').obj;
const argv = require('yargs').argv;
const path = require('path');

const logger = require('./lib/logger');
const GraphStructure = require('./lib/graph/GraphStructure');
const Renderer = require('./lib/compiler/Renderer');
const FileManager = require('./lib/compiler/FileManager');
const WatcherQueue = require('./lib/Watcher/WatcherQueue');
const utils = require('./lib/utils-functions');
const validateArguments = require('./lib/validator/paramsValidator');

const cwd = process.cwd();

validateArguments(argv.src, argv.output);

const manager = new FileManager(argv.src, argv.output, cwd);

if (!utils.existsDirectory(manager.getOutputDir())) {
  utils.mkdirp(manager.getOutputDir());
}

const graph = new GraphStructure(manager);
const renderer = new Renderer(manager, graph.getFoundedPaths());
const wQueue = new WatcherQueue(graph.getFiles());

console.reset();

let isFirstBuildValid = false;
let isCompiling = false;
const watcher = chokidar.watch(wQueue.getQueue());

const compileLess = (newFile, isMainFile = false) => {
  console.reset();

  const stream = vfs.src(newFile);

  stream
    .pipe(
      through(function(file, enc, done) {
        if (isCompiling) {
          return;
        }

        let str = file.contents.toString();

        const { removedImports, newImports } = graph.getImportStateFromFile(
          file.path
        );

        if (newImports.length) {
          addNewFilesToWatch(newImports);
        }

        if (removedImports.length) {
          removedImports
            .filter(graph.shouldBeUnWatched.bind(graph))
            .forEach(unwatchFile);
        }

        logger.logInfoBuild(newFile);

        isCompiling = true;
        renderer
          .render(str)
          .then(
            function({ css }) {
              let contents = css;

              if (isMainFile) {
                file.contents = new Buffer(contents);
                manager.setRootFile(file);
                isFirstBuildValid = true;
              }

              const isRootFileEmpty = manager.isRootFileEmpty();

              if (!isMainFile && !isRootFileEmpty) {
                manager.replaceContentInMainFile(newFile, contents);
              }

              if (!isRootFileEmpty) {
                this.push(manager.getBufferFromRootFile());
              }

              isCompiling = false;

              if (!isFirstBuildValid) {
                compileLess(manager.getInputFile(), true);
              }

              done();
            }.bind(this)
          )
          .catch(err => {
            if (isMainFile) {
              isFirstBuildValid = false;
            }

            isCompiling = false;
            logger.logErrorBuild(err);
          });
      })
    )
    .pipe(fs.createWriteStream(manager.getOutputFile()))
    .on('finish', () => {
      logger.logSuccessBuild();
    });
};

const unwatchFile = filePath => {
  const index = wQueue.findIndexPath(filePath);
  manager.replaceContentInMainFile(filePath, '');

  if (index !== -1) {
    wQueue.remove(index);
    watcher.unwatch(filePath);
  }
};

const addNewFilesToWatch = (paths = []) => {
  paths.filter(p => !wQueue.isWatched(p)).forEach(addNewFileToWatch);
};

const addNewFileToWatch = newImport => {
  renderer.pushNewPath(path.dirname(newImport));
  wQueue.addToWatch(newImport);
  watcher.add(newImport);
};

watcher
  .on('add', filePath => {
    const isMain = manager.isMainFile(filePath);
    if (isMain) {
      compileLess(filePath, isMain);
    }
  })
  .on('change', filePath => {
    compileLess(filePath, manager.isMainFile(filePath));
  })
  .on('unlink', filePath => {
    unwatchFile(filePath);
  });

module.exports = compileLess;
