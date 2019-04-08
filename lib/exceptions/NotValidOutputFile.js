const {
  RequiredParamException
} = require('./RequiredParamException');

class NotValidOutputFile extends RequiredParamException {
  constructor(param, message = 'has not a valid extension. Provide a css file') {
    super(param, message);
  }
}

exports.NotValidOutputFile = NotValidOutputFile;
