const createGraph = require('./create');
const path = require('path');

class GraphStructure {
  constructor(fileManager) {
    this.manager = fileManager;
    this.graph = this.createFromFile(this.manager.getInputFile());
  }

  createFromFile(filePath) {
    return createGraph(filePath);
  }

  getFiles() {
    return Object.keys(this.graph.index);
  }

  getFoundedPaths() {
    const cwd = this.manager.getCwd();
    const foundedPaths = this.graph.foundedPaths || [];
    const paths = foundedPaths.map(p => path.relative(cwd, p) + '/');

    if (!paths.length) {
      paths.push(path.dirname(this.manager.getInputFile()));
    }

    return paths;
  }

  getImportsFromFile(filePath) {
    if (!this.hasFileInfo(filePath)) {
      return [];
    }

    const fileInfo = this.getFileInfo(filePath);

    return fileInfo.imports;
  }

  hasFileInfo(filePath) {
    return filePath in this.graph.index;
  }

  addFileInfoToGraph(newInfo, filePath) {
    this.graph.index[filePath] = newInfo;
  }

  updateFileImportsIntoGraph(imports, filePath) {
    if (!this.hasFileInfo(filePath)) {
      return false;
    }

    this.graph.index[filePath].imports = imports;

    return true;
  }

  getNewImportsFromFile(fileImports, filePath) {
    const currentImports = this.getImportsFromFile(filePath);

    return fileImports.filter(newImp => !currentImports.includes(newImp));
  }

  getRemovedImportsFromFile(fileImports, filePath) {
    const currentImports = this.getImportsFromFile(filePath);

    return currentImports.filter(imp => !fileImports.includes(imp));
  }

  getImportStateFromFile(filePath) {
    let newImports = [];
    let removedImports = [];
    const fileGraph = this.createFromFile(filePath);
    const fileInfo = fileGraph.index[filePath];
    const pathImports = fileInfo.imports;

    newImports = this.getNewImportsFromFile(pathImports, filePath);
    removedImports = this.getRemovedImportsFromFile(pathImports, filePath);

    if (newImports.length) {
      const result = this._getAllNewImports(newImports, []);
      newImports = newImports.concat(...result);
      newImports = [...new Set(newImports)];
    }

    if (!this.hasFileInfo(filePath)) {
      this.addFileInfoToGraph(fileInfo, filePath);
    }

    this.updateFileImportsIntoGraph(pathImports, filePath);

    return {
      newImports,
      removedImports,
    };
  }

  _getAllNewImports(foundedNewImports, importsToWatch = []) {
    foundedNewImports.forEach(newImp => {
      if (importsToWatch.includes(newImp)) {
        return importsToWatch;
      }

      importsToWatch.push(newImp);

      const importGraph = this.createFromFile(newImp);
      const imports = (importGraph.index[newImp] || {}).imports || [];
      if (imports.length) {
        const toWatch = this._getAllNewImports(imports, importsToWatch);
        importsToWatch = [].concat(...toWatch);
      }
    });

    return importsToWatch;
  }

  shouldBeUnWatched(delImport, importedFrom) {
    if (!this.hasFileInfo(delImport)) {
      return true;
    }

    const fileInfo = this.getFileInfo(delImport);
    fileInfo.importedBy = fileInfo.importedBy.filter(x => x !== importedFrom);
    return fileInfo.importedBy.length === 0;
  }

  getFileInfo(filePath) {
    return this.graph.index[filePath];
  }

  getImportedBy(filePath) {
    if (!this.hasFileInfo(filePath)) {
      return [];
    }

    const fileInfo = this.getFileInfo(filePath);
    return fileInfo.importedBy || [];
  }

  updateImportedByFromDependencies(filePath) {
    if (this.hasFileInfo(filePath)) {
      return true;
    }

    const fileInfo = this.getFileInfo(filePath);

    console.log(fileInfo);
  }
}

module.exports = GraphStructure;
