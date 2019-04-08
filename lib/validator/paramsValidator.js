const RequiredParamException = require('../exceptions/RequiredParamException');
const NotValidOutputFileException = require('../exceptions/NotValidOutputFileException');

const {
  extname,
} = require('path');

const CSS_EXTENSION = '.css';

exports.validateArguments = (argv) => {
  const mainFile = argv.src;
  const output = argv.output;
  if (!mainFile) {
    new RequiredParamException('src')
  }

  if (!output) {
    new RequiredParamException('ouput')
  } else if (extname(output) !== CSS_EXTENSION) {
    new NotValidOutputFileException(`output Param`)
  }

}
