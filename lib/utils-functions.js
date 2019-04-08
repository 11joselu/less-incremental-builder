const fs = require('fs');
const path = require('path');

exports.mkdirp = (filepath) => {
  var dirname = path.dirname(filepath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, {
      recursive: true
    });
  }
}
