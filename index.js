const chokidar = require('chokidar');
const less = require('less');
const vfs = require('vinyl-fs');
const fs = require('fs');
const through = require('through2').obj;
const argv = require('yargs').argv
const {
  relative
} = require('path')

const logger = require('./lib/logger');
const {
  loadGraph
} = require('./lib/graph/loader');
const {
  mkdirp
} = require('./lib/utils-functions');

console.reset();

const hashMap = {};
const cwd = process.cwd();
const hashPlugin = require('./lib/lessPlugin/hashPlugin')(hashMap, cwd);

const mainFile = argv.src;
const output = argv.output;

mkdirp(output);

const lessCompiler = (content) => {
  return less.render(content, {
    paths,
    plugins: [hashPlugin]
  })
}

const MaperContent = {};

const mainGraph = loadGraph(mainFile);
const watchingQueue = Object.keys(mainGraph.index);
const paths = mainGraph.foundedPaths.map(p => relative(cwd, p));
// TODO: Change this line by resolving variables/mixins paths. May cause a performance issue in larges projects
const importantFiles = watchingQueue.map((path) => `@import (reference) '${path}'`);

let rootFile = null;
let isFirstBuildValid = false;

const watcher = chokidar.watch(watchingQueue);

const isMainFile = (path) => {
  const relativePath = relative(cwd, path);

  return mainFile.indexOf(relativePath) >= 0;
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
        const joined = importantFiles.join(';\n');
        str = joined + ';' + str;
      }

      logger.logInfoBuild(path);

      lessCompiler(str)
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
  const hash = hashMap[path];
  const re = new RegExp(`(\\/\\*${hash}\\*\\/)(.|\\n)*?\\/\\*${hash}\\*\\/`, "g");

  let currentContent = rootFile.contents.toString();
  currentContent = currentContent.replace(re, `$1\n${css}\n$1`);
  rootFile.contents = new Buffer(currentContent);
}

const unwatchFile = (path) => {

  replaceContentInMainFile(path, '');

  delete MaperContent[path];
  const index = watchingQueue.findIndex(file => file === path);

  if (index !== -1) {
    watchingQueue.splice(index, 1);
    watcher.unwatch(path);
  }

}

const alreadyIsWatching = (path) => watchingQueue.includes(path);

const getImportStateFromPath = (path) => {
  const {
    imports = []
  } = mainGraph.index[path] || {};
  const pathGraph = loadGraph(path);
  const pathImports = pathGraph.index[path] || {};
  pathImports.imports = pathImports.imports || [];
  const newImports = pathImports.imports.filter(newImp => !imports.includes(newImp));
  const removedImports = imports.filter(imp => !pathImports.imports.includes(imp));

  if (!(path in mainGraph.index)) {
    mainGraph.index[path] = pathImports;
  }

  mainGraph.index[path].imports = pathImports.imports;

  return {
    newImports,
    removedImports,
  };
}

const shouldBeUnWatched = (path, importedFrom) => {
  if (!(path in mainGraph.index)) {
    return true;
  }

  const pathGraph = mainGraph.index[path]
  const {
    importedBy = []
  } = pathGraph;
  const unwatchList = importedBy
    .filter(by => by !== importedFrom);

  pathGraph.importedBy = unwatchList;

  return unwatchList.length !== 0;
}

const addNewFileToWatch = (path) => {
  watchingQueue.push(path);
  watcher.add(path);
};

const addNewFilesToWatch = (paths = []) => {
  paths
    .filter(p => !alreadyIsWatching(p))
    .forEach(addNewFileToWatch);
}

watcher
  .on('add', (path) => {
    const isMain = isMainFile(path);
    if (isMain) {
      compileLess(path, isMain, true);
    }
  })
  .on('change', path => {
    compileLess(path, isMainFile(path))
  })
  .on('unlink', path => {
    unwatchFile(path);
  });
