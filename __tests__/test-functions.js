const fs = require('fs');
const path = require('path');
const vfs = require('vinyl-fs');

const createFakeContent = (hash) => {
  return (`
    @import "${hash}";
  `);
}

exports.createLessFile = (content) => {
  const now = Date.now();
  const filename = `${now}.less`;
  const filePath = path.resolve('__tests__', 'build', filename);
  content = content || createFakeContent(now);
  fs.writeFileSync(filePath, content, {
    flag: 'w'
  });

  return {
    filename,
    path: filePath,
    hash: now,
    content,
  }
}

exports.createStream = (filePath) => {
  return vfs.src(filePath);
}
