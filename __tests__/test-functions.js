const fs = require('fs');
const {
  resolve
} = require('path');

const createFakeContent = (hash) => {
  return (`
    @import "${hash}";
  `);
}

exports.createLessFile = () => {
  const now = Date.now();
  const filename = `${now}.less`;
  const path = resolve('__tests__', 'build', filename);
  const content = createFakeContent(now);

  fs.writeFileSync(path, content, {
    flag: 'w'
  });

  return {
    filename,
    path,
    hash: now,
    content,
  }
}
