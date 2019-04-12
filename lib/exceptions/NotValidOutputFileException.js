const RequiredParamException = require('./RequiredParamException');

class NotValidOutputFileException extends RequiredParamException {
  constructor(
    param,
    defaultMessage = 'has not a valid extension. Provide a css file'
  ) {
    super(param, defaultMessage);
    this.name = 'NotValidOutputFileException';
  }
}

module.exports = NotValidOutputFileException;
