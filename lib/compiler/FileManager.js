const validateArguments = require('../validator/paramsValidator');
const path = require('path')

class FileManager {
  constructor(inputFile, outputFile, cwd) {
    validateArguments(inputFile, outputFile);

    this.inputFile = inputFile
    this.outputFile = outputFile;
    this.cwd = cwd;
    this.rootFile = null;
  }

  replaceContentInRootFileByHash(hash, content) {
    const re = new RegExp(`(\\/\\*${hash}\\*\\/)(.|\\n)*?\\/\\*${hash}\\*\\/`, "g");
    let currentContent = this.getRootFileContentString();
    const newContent = currentContent.replace(re, `$1\n${content}\n$1`);

    this.overrideRootBufferContent(newContent);
  }

  getRootFileContentString() {
    return this.rootFile.contents.toString();
  }

  overrideRootBufferContent(newContents) {
    this.rootFile.contents = new Buffer(newContents);
  }

  isMainFile(filePath) {
    return this.getInputFile() === path.relative(this.getCwd(), filePath);
  }

  getInputFile() {
    return this.inputFile;
  }

  setRootFile(file) {
    this.rootFile = file;
  }

  isRootFileEmpty() {
    this.rootFile === null;
  }

  getBufferFromRootFile() {
    return this.rootFile.contents;
  }

  getOutputFile() {
    return this.outputFile;
  }

  getCwd() {
    return this.cwd;
  }
}

module.exports = FileManager;
