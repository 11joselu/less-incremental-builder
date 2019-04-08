const chalk = require('chalk');

class RequiredParamException {
  constructor(param, message = 'param is missing or the value is empty') {
    throw new Error(this.styleMessage(param, message));
  }

  styleMessage(param, message) {
    let _message = chalk.red(param) + " " + chalk.red(message);
    return _message;
  }
}

exports.RequiredParamException = RequiredParamException;
