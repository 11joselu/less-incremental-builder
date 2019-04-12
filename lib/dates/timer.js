const formatDateNumber = (n) => {
  return n < 10 ? '0' + n.toString() : n;
};

exports.getTime = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = formatDateNumber(date.getMonth() + 1);
  const day = formatDateNumber(date.getDate());
  const hours = formatDateNumber(date.getHours());
  const minutes = formatDateNumber(date.getMinutes());
  const seconds = formatDateNumber(date.getSeconds());

  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
};
