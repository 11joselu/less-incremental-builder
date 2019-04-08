const RequiredParamException = require('./RequiredParamException');

class NotValidOutputFileException extends RequiredParamException {
  constructor(param, message = 'has not a valid extension. Provide a css file') {
    super(param, message);
  }
}

module.exports = NotValidOutputFileException;
