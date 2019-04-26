const vfs = require('vinyl-fs');
const fs = require('fs');
const through = require('through2').obj;
const path = require('path');

const logger = require('../logger');
const { promiseHandler } = require('../utils-functions');

class Compile {
  constructor(graphStructure, wQueue, lessRenderer) {
    this.graph = graphStructure;
    this.manager = this.graph.manager;
    this.wQueue = wQueue;
    this.lessRenderer = lessRenderer;
    this.isCompiling = false;
    this.isFirstBuildValid = false;
  }

  async compile(filePath, isMainFile) {
    console.reset();

    if (this.isCompiling) {
      return;
    }

    const [error, result] = await promiseHandler(
      this._compileStream(filePath, isMainFile)
    );

    if (error) {
      throw error;
    }

    return { css: result, extra: { file: filePath, isMainFile } };
  }

  _compileStream(filePath, isMainFile) {
    const TIME_WRITE_STREAM = 100;
    const self = this;

    return new Promise(resolve => {
      let timer = null;
      clearTimeout(timer);

      timer = setTimeout(() => {
        const stream = self._toStream(filePath);

        stream
          .pipe(
            through(async function(file, enc, done) {
              let contentStr = file.contents.toString();
              const {
                newImports,
                removedImports,
              } = self.graph.getImportStateFromFile(file.path);

              if (newImports.length) {
                self._addNewFilesToWatch(newImports);
              }

              if (removedImports.length) {
                const _removedImports = removedImports.filter(
                  self.graph.shouldBeUnWatched.bind(self.graph)
                );

                _removedImports.forEach(self._unwatchFile.bind(self));
              }

              logger.logInfoBuild(filePath);

              self.isCompiling = true;

              const [err, data] = await promiseHandler(
                self.lessRenderer.render(contentStr)
              );

              if (err) {
                self._errorOnCompile(err, isMainFile);
                resolve(err);
              } else {
                const compileContent = data.css;

                if (isMainFile) {
                  self._updateMainFileContent(file, compileContent);
                }

                const isRootFileEmpty = self.manager.isRootFileEmpty();

                if (!isMainFile && !isRootFileEmpty) {
                  self.manager.replaceContentInMainFile(
                    filePath,
                    compileContent
                  );
                }

                if (!isRootFileEmpty) {
                  this.push(self.manager.getBufferFromRootFile());
                }

                if (!self.isFirstBuildValid) {
                  self.compileLess(self.manager.getInputFile(), true);
                }

                resolve(data.css);
              }

              done();
            })
          )
          .pipe(fs.createWriteStream(self.manager.getOutputFile()))
          .on('finish', () => {
            self.isCompiling = false;
            logger.logSuccessBuild();
          });
      }, TIME_WRITE_STREAM);
    });
  }

  _toStream(filePath) {
    return vfs.src(filePath);
  }

  _addNewFilesToWatch(newImports) {
    const importsToWatch = newImports.filter(p => !this.wQueue.isWatched(p));
    importsToWatch.forEach(this._addNewFileToWatch.bind(this));
  }

  _addNewFileToWatch(newImport) {
    this.lessRenderer.pushNewPath(path.dirname(newImport));
    this.wQueue.addToWatch(newImport);
  }

  _unwatchFile(filePath) {
    const index = this.wQueue.findIndexPath(filePath);
    this.manager.replaceContentInMainFile(filePath, '');

    if (index !== -1) {
      this.wQueue.remove(index);
      this.wQueue.unwatchFile(filePath);
    }
  }

  _errorOnCompile(err, isMainFile) {
    if (isMainFile) {
      this.isFirstBuildValid = false;
    }

    this.isCompiling = false;
    logger.logErrorBuild(err);
  }

  _updateMainFileContent(file, compileContent) {
    file.contents = new Buffer(compileContent);
    this.manager.setRootFile(file);
    this.isFirstBuildValid = true;
  }

  unwatchFile(filePath) {
    const index = this.wQueue.findIndexPath(filePath);
    this.manager.replaceContentInMainFile(filePath, '');

    if (index !== -1) {
      this.wQueue.remove(index);
    }
  }
}

module.exports = Compile;
