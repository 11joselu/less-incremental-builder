const chokidar = require('chokidar');
const vfs = require('vinyl-fs');
const fs = require('fs');
const through = require('through2').obj;
const argv = require('yargs').argv
const path = require('path')

const logger = require('./lib/logger');
const loadGraph = require('./lib/graph/loader');
const Renderer = require('./lib/compiler/Renderer');
const FileManager = require('./lib/compiler/FileManager');
const WatcherQueue = require('./lib/Watcher/WatcherQueue');

const utils = require('./lib/utils-functions');
const cwd = process.cwd();

const fileManager = new FileManager(argv.src, argv.output, cwd);

if (!utils.existsDirectory(fileManager.getOutputDir())) {
  utils.mkdirp(fileManager.getOutputDir());
}

const graph = loadGraph(fileManager.getInputFile());
const wQueue = new WatcherQueue(Object.keys(graph.index));

console.reset();

let isFirstBuildValid = false;

const watcher = chokidar.watch(wQueue.getQueue());

const paths = utils.getPathsForLessPlugin(graph, cwd, fileManager.getInputFile());
const renderer = new Renderer(paths, cwd);

var isCompiling = false;

const compileLess = (newFile, isMainFile = false) => {
  console.reset();

  const stream = vfs.src(newFile);

  stream
    .pipe(through(function (file, enc, done) {
      if (isCompiling) {
        return;
      }

      let str = file.contents.toString();

      const {
        removedImports,
        newImports
      } = getImportStateFromPath(file.path);

      if (newImports.length) {
        addNewFilesToWatch(newImports);
      }

      if (removedImports.length) {
        removedImports
          .filter((f) => shouldBeUnWatched(f, file.path))
          .forEach(unwatchFile);
      }

      logger.logInfoBuild(newFile);

      isCompiling = true;
      renderer.render(str)
        .then(function ({
          css
        }) {
          let contents = css;

          if (isMainFile) {
            file.contents = new Buffer(contents);
            fileManager.setRootFile(file);
            isFirstBuildValid = true;
          }

          const isRootFileEmpty = fileManager.isRootFileEmpty();

          if (!isMainFile && !isRootFileEmpty) {
            replaceContentInMainFile(newFile, contents);
          }

          if (!isRootFileEmpty) {
            this.push(fileManager.getBufferFromRootFile());
          }

          isCompiling = false;

          if (!isFirstBuildValid) {
            compileLess(fileManager.getInputFile(), true);
          }

          done();
        }.bind(this))
        .catch((err) => {
          if (isMainFile) {
            isFirstBuildValid = false;
          }

          isCompiling = false;
          logger.logErrorBuild(err);
        });
    }))
    .pipe(fs.createWriteStream(fileManager.getOutputFile()))
    .on('finish', () => {
      logger.logSuccessBuild();
    });
}

const replaceContentInMainFile = (filePath, css) => {
  const hash = renderer.getFileHash(filePath);

  if (!hash) {
    return;
  }

  fileManager.replaceContentInRootFileByHash(hash, css);
}

const unwatchFile = (filePath) => {
  const index = wQueue.findIndexPath(filePath);
  replaceContentInMainFile(filePath, '');

  if (index !== -1) {
    wQueue.remove(index);
    watcher.unwatch(filePath);
  }
}

const getImportStateFromPath = (filePath) => {
  const {
    imports = []
  } = graph.index[filePath] || {};
  let newImports = [];
  let removedImports = [];
  try {
    const pathGraph = loadGraph(filePath);
    const pathImports = pathGraph.index[filePath];
    newImports = pathImports.imports.filter(newImp => !imports.includes(newImp));
    removedImports = imports.filter(imp => !pathImports.imports.includes(imp));

    if (!(filePath in graph.index)) {
      graph.index[filePath] = pathImports;
    }

    graph.index[filePath].imports = pathImports.imports;
  } catch (e) {
    logger.warnInfo(`Somthing went wrong with ${filePath}, so make some changes`);
  }

  return {
    newImports,
    removedImports,
  };
}

const shouldBeUnWatched = (filePath, importedFrom) => {
  if (!(filePath in graph.index)) {
    return true;
  }

  const pathGraph = graph.index[filePath]
  const {
    importedBy = []
  } = pathGraph;
  const unwatchList = importedBy
    .filter(by => by !== importedFrom);

  pathGraph.importedBy = unwatchList;

  return unwatchList.length !== 0;
}

const addNewFileToWatch = (newImport) => {
  renderer.pushNewPath(path.dirname(newImport));
  wQueue.addToWatch(newImport);
  watcher.add(newImport);
};

const addNewFilesToWatch = (paths = []) => {
  paths
    .filter(p => !wQueue.isWatched(p))
    .forEach(addNewFileToWatch);
}

watcher
  .on('add', (filePath) => {
    const isMain = fileManager.isMainFile(filePath);
    if (isMain) {
      compileLess(filePath, isMain);
    }
  })
  .on('change', filePath => {
    compileLess(filePath, fileManager.isMainFile(filePath))
  })
  .on('unlink', filePath => {
    unwatchFile(filePath);
  });
