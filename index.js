const chokidar = require('chokidar');
const vfs = require('vinyl-fs');
const fs = require('fs');
const through = require('through2').obj;
const argv = require('yargs').argv
const path = require('path')

const logger = require('./lib/logger');
const loadGraph = require('./lib/graph/loader');
const validateArguments = require('./lib/validator/paramsValidator');
const Parser = require('./lib/compiler/Parser');
const {
  mkdirp,
  getPathsFromGraph,
} = require('./lib/utils-functions');

const cwd = process.cwd();
const mainFile = argv.src;
const output = argv.output;

validateArguments(argv);
mkdirp(output);

const graph = loadGraph(mainFile);
const watchingQueue = Object.keys(graph.index);

console.reset();

let rootFile = null;
let isFirstBuildValid = false;

const watcher = chokidar.watch(watchingQueue);

const paths = getPathsFromGraph(graph, cwd, mainFile);
const parser = new Parser(paths, cwd);

const isMainFile = (filePath) => {
  return mainFile === path.relative(cwd, filePath);
}

const compileLess = (path, isMainFile = false) => {
  console.reset();

  const stream = vfs.src(path);

  stream
    .pipe(through(function (file, enc, done) {
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

      if (!isMainFile) {
        // TODO: Change this line by resolving variables/mixins paths. May cause a performance issue in larges projects
        const importantFiles = watchingQueue.map((path) => `@import (reference) '${path}'`);
        const joined = importantFiles.join(';\n');
        str = joined + ';' + str;
      }

      logger.logInfoBuild(path);

      parser.render(str)
        .then(function ({
          css
        }) {
          let contents = css;

          if (isMainFile) {
            file.contents = new Buffer(contents);
            rootFile = file;
            isFirstBuildValid = true;
          }

          if (!isMainFile && rootFile) {
            replaceContentInMainFile(path, contents);
          }

          if (rootFile) {
            this.push(rootFile.contents);
          }

          if (!isFirstBuildValid) {
            compileLess(mainFile, true);
          }

          done();
        }.bind(this))
        .catch((err) => {
          if (isMainFile) {
            isFirstBuildValid = false;
          }

          logger.logErrorBuild(err);
        });
    }))
    .pipe(fs.createWriteStream(output))
    .on('finish', () => {
      logger.logSuccessBuild();
    });
}

const replaceContentInMainFile = (path, css) => {
  const hash = parser.getFileHash(path);

  if (!hash) {
    return;
  }

  const re = new RegExp(`(\\/\\*${hash}\\*\\/)(.|\\n)*?\\/\\*${hash}\\*\\/`, "g");
  let currentContent = rootFile.contents.toString();

  currentContent = currentContent.replace(re, `$1\n${css}\n$1`);
  rootFile.contents = new Buffer(currentContent);
}

const unwatchFile = (path) => {
  const index = watchingQueue.findIndex(file => file === path);
  replaceContentInMainFile(path, '');

  if (index !== -1) {
    watchingQueue.splice(index, 1);
    watcher.unwatch(path);
  }
}

const getImportStateFromPath = (path) => {
  const {
    imports = []
  } = graph.index[path] || {};
  const pathGraph = loadGraph(path);
  const pathImports = pathGraph.index[path] || {};
  pathImports.imports = pathImports.imports || [];
  const newImports = pathImports.imports.filter(newImp => !imports.includes(newImp));
  const removedImports = imports.filter(imp => !pathImports.imports.includes(imp));

  if (!(path in graph.index)) {
    graph.index[path] = pathImports;
  }

  graph.index[path].imports = pathImports.imports;

  return {
    newImports,
    removedImports,
  };
}

const shouldBeUnWatched = (path, importedFrom) => {
  if (!(path in graph.index)) {
    return true;
  }

  const pathGraph = graph.index[path]
  const {
    importedBy = []
  } = pathGraph;
  const unwatchList = importedBy
    .filter(by => by !== importedFrom);

  pathGraph.importedBy = unwatchList;

  return unwatchList.length !== 0;
}

const addNewFileToWatch = (path) => {
  parser.pushNewPath(path.dirname(path));
  watchingQueue.push(path);
  watcher.add(path);
};

const addNewFilesToWatch = (paths = []) => {
  paths
    .filter(p => !watchingQueue.includes(p))
    .forEach(addNewFileToWatch);
}

watcher
  .on('add', (path) => {
    const isMain = isMainFile(path);
    if (isMain) {
      compileLess(path, isMain);
    }
  })
  .on('change', path => {
    compileLess(path, isMainFile(path))
  })
  .on('unlink', path => {
    unwatchFile(path);
  });
