const RequiredParamException = require('../exceptions/RequiredParamException');
const NotValidOutputFileException = require('../exceptions/NotValidOutputFileException');

const {
  extname,
} = require('path');

const CSS_EXTENSION = '.css';

module.exports = (inputFile, outputFile) => {
  if (!inputFile) {
    throw new RequiredParamException('src')
  }

  if (!outputFile) {
    throw new RequiredParamException('ouput')
  } else if (extname(outputFile) !== CSS_EXTENSION) {
    throw new NotValidOutputFileException(`output Param`)
  }

  return true;
}
