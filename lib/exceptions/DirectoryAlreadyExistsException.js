class DirectoryAlreadyExistsException extends Error {
  constructor(dir, defaultMessage = 'Directory already exists') {
    const message = dir + ' ' + defaultMessage;
    super(message);

    this.name = 'DirectoryAlreadyExistsException';
  }
}

module.exports = DirectoryAlreadyExistsException;
