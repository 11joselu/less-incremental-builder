class RequiredParamException extends Error {
  constructor(
    param,
    defaultMessage = 'param is missing or the value is empty'
  ) {
    const message = param + ' ' + defaultMessage;
    super(message);
    this.name = 'RequiredParamException';
  }
}

module.exports = RequiredParamException;
