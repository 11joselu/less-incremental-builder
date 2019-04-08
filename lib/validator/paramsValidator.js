const RequiredParamException = require('../exceptions/RequiredParamException');
const NotValidOutputFileException = require('../exceptions/NotValidOutputFileException');

const {
  extname,
} = require('path');

const CSS_EXTENSION = '.css';

module.exports = (argv = {}) => {
  const mainFile = argv.src;
  const output = argv.output;
  if (!mainFile) {
    throw new RequiredParamException('src')
  }

  if (!output) {
    throw new RequiredParamException('ouput')
  } else if (extname(output) !== CSS_EXTENSION) {
    throw new NotValidOutputFileException(`output Param`)
  }

}
