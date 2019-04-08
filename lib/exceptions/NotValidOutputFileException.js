const RequiredParamException = require('./RequiredParamException');

class NotValidOutputFileException extends RequiredParamException {
  constructor(param, defaulMessage = 'has not a valid extension. Provide a css file') {
    super(param, defaulMessage);
    this.name = 'NotValidOutputFileException';
  }
}

module.exports = NotValidOutputFileException;
