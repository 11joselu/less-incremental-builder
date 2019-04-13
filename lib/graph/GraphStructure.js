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

  updateFileImportedByIntoGraph(importedBy, filePath) {
    if (!this.hasFileInfo(filePath)) {
      return false;
    }

    this.graph.index[filePath].importedBy = importedBy;

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

    if (!this.hasFileInfo(filePath)) {
      this.addFileInfoToGraph(fileInfo, filePath);
    }

    this.updateFileImportsIntoGraph(pathImports, filePath);
    this.updateFileImportedByIntoGraph(fileInfo.importedBy, filePath);

    return {
      newImports,
      removedImports,
    };
  }

  shouldBeUnWatched(filePath) {
    if (!this.hasFileInfo(filePath)) {
      return true;
    }

    const fileInfo = this.getFileInfo(filePath);

    return fileInfo.importedBy.length === 0;
  }

  getFileInfo(filePath) {
    return this.graph.index[filePath];
  }
}

module.exports = GraphStructure;
