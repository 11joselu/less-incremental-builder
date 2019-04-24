const chalk = require('chalk');
const { getTime } = require('../dates/timer');

const { SUCCESS_TYPE, ERROR_TYPE, WARN_TYPE } = require('../logger/types');

const log = console.log.bind(console);

console.reset = function() {
  return process.stdout.write('\033c');
};

const styleTitleByType = (type, title) => {
  switch (type) {
    case SUCCESS_TYPE:
      title = this.createSuccessTitle(title);
      break;

    case WARN_TYPE:
      title = this.createWarnTitle(title);
      break;

    case ERROR_TYPE:
      title = this.createDangerTitle(title);
      break;

    default:
      break;
  }

  return title;
};

const buildLog = (title, fileName, type) => {
  title = styleTitleByType(type, title);

  let time = this.createSecondaryText(getTime());
  const isSuccess = type === SUCCESS_TYPE;
  time = isSuccess ? '\t' + time : time;
  fileName = this.createSecondaryText(fileName);

  return `${title}${time ? '\t\t\t' + time : ''}\n${fileName}`;
};

exports.createSuccessTitle = title => {
  return chalk.black.bgGreen(title);
};

exports.createDangerTitle = title => {
  return chalk.black.bgRed(title);
};

exports.createWarnTitle = title => {
  return chalk.black.bgYellow(title);
};

exports.createSecondaryText = text => {
  return chalk.gray(text);
};

exports.logSuccessBuild = (fileName = '') => {
  const message = buildLog('Build', fileName, SUCCESS_TYPE);
  log(message);
};

exports.logInfoBuild = fileName => {
  const message = buildLog('Compiling...', fileName + '\n', WARN_TYPE);
  log(message);
};

exports.logErrorBuild = error => {
  let message = buildLog('Failed !', '', ERROR_TYPE);
  message += chalk.grey('\nError:') + ' ' + chalk.red(error.message);
  message += chalk.underline.red(
    `\n\non line ${error.line} column ${error.column} of ${error.filename}`
  );
  log(message);
};

exports.warnInfo = message => {
  const _message = this.createWarnTitle('WARN') + ' ' + chalk.grey(message);
  log(_message);
};
