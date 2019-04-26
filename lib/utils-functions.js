const fs = require('fs');
const crypto = require('crypto');
const DirectoryAlreadyExistsException = require('./exceptions/DirectoryAlreadyExistsException');

exports.mkdirp = dirname => {
  if (this.existsDirectory(dirname)) {
    throw new DirectoryAlreadyExistsException(dirname);
  }

  fs.mkdirSync(dirname, {
    recursive: true,
  });

  return true;
};

exports.existsDirectory = dirname => {
  return fs.existsSync(dirname);
};

exports.hash = string =>
  crypto
    .createHash('md5')
    .update(string)
    .digest('hex');

exports.promiseHandler = promiseFn => {
  return promiseFn
    .then(data => {
      if (data instanceof Error) {
        return [data];
      }

      return [null, data];
    })
    .catch(err => {
      return [err];
    });
};
