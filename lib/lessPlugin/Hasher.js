const path = require('path');

const {
  hash
} = require('../utils-functions');

const MAIN_FILE_NAME = 'input';

function Hasher(cwd, map) {
  this.cwd = cwd;
  this.map = map;
}

Hasher.prototype.hashFile = (filename) => {
  return hash(`${filename}`);
};

Hasher.prototype.toLessComment = (hashed) => {
  return `/*${hashed}*/`;
};

Hasher.prototype.process = function (styles, extra) {
  if (!extra) {
    return styles;
  }

  const {
    fileInfo
  } = extra;
  let {
    filename
  } = fileInfo;

  if (filename === MAIN_FILE_NAME) {
    return styles;
  }

  filename = path.resolve(this.cwd, filename);
  const hashedFile = this.hashFile(filename);
  const comment = this.toLessComment(hashedFile);
  let newStylesContent = comment;
  newStylesContent += '\n' + styles + '\n';
  newStylesContent += comment;

  this.map.set(filename, hashedFile);

  return newStylesContent;
};

Hasher.prototype.getHashedFileByFileName = function (filename) {
  return this.map.get(filename);
};

module.exports = Hasher;
