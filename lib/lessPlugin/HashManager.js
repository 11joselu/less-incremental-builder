const crypto = require('crypto');
const {
  resolve
} = require('path');

const hash = (string) => crypto.createHash('md5').update(string).digest('hex');

function HashManager(cwd, map = {}) {
  this.cwd = cwd;
  this.map = map;
}

HashManager.prototype.hashFile = (filename) => {
  return hash(`${filename}`);
}

HashManager.prototype.asLessComment = (hashed) => {
  return `/*${hashed}*/`;
}

HashManager.prototype.process = function (styles, extra) {
  const {
    fileInfo
  } = extra;
  let {
    filename
  } = fileInfo;

  if (filename === 'input') {
    return styles;
  }

  filename = resolve(this.cwd, filename);
  const hashedFile = this.hashFile(filename);

  let newStylesContent = this.asLessComment(hashedFile);
  newStylesContent += "\n" + styles + "\n";
  newStylesContent += this.asLessComment(hashedFile);

  this.map[filename] = hashedFile;

  return newStylesContent;
};

exports.HashManager = HashManager;
exports.hashString = hash;
