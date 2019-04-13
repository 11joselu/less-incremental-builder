const path = require('path');

class FileManager {
  constructor(inputFile, outputFile, cwd) {
    this.map = new Map();
    this.inputFile = inputFile;
    this.outputFile = outputFile;
    this.cwd = cwd;
    this.rootFile = null;
  }

  getFileHash(key) {
    return this.map.get(key);
  }

  replaceContentInMainFile(filePath, css) {
    const hash = this.getFileHash(filePath);

    if (!hash) {
      return false;
    }

    const content = this.getReplacedContent(hash, css);
    this.overrideRootBufferContent(content);

    return true;
  }

  getReplacedContent(hash, content) {
    const re = new RegExp(
      `(\\/\\*${hash}\\*\\/)(.|\\n)*?\\/\\*${hash}\\*\\/`,
      'g'
    );
    let currentContent = this.getRootFileContentString();

    return currentContent.replace(re, `$1\n${content}\n$1`);
  }

  getRootFileContentString() {
    return this.rootFile.contents.toString();
  }

  overrideRootBufferContent(newContents) {
    this.rootFile.contents = new Buffer(newContents);
  }

  isMainFile(filePath) {
    const input = this.getInputFile();

    return (
      input === filePath || input === path.relative(this.getCwd(), filePath)
    );
  }

  getInputFile() {
    return this.inputFile;
  }

  setRootFile(file) {
    this.rootFile = file;
  }

  isRootFileEmpty() {
    return this.rootFile === null;
  }

  getBufferFromRootFile() {
    return this.rootFile.contents;
  }

  getOutputFile() {
    return this.outputFile;
  }

  getOutputDir() {
    return path.dirname(this.getOutputFile());
  }

  getCwd() {
    return this.cwd;
  }

  getMap() {
    return this.map;
  }
}

module.exports = FileManager;
