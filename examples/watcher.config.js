module.exports = {
  src: './static/less/main.less',
  output: './build/styles.css',
  // Add less Options
  lessOptions: { sourceMap: { sourceMapFileInline: true } },
  // Listen to sucess build evens:
  // CSS could be compilated less file or an error message
  // You can use this aproach to make a hot replacements with sockets
  onBuildSuccess: function({ css, extra }) {} /* eslint-disable-line */,
};
