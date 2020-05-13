const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const liveReload = require('webpack-livereload-plugin');

module.exports = merge(common, {
  mode: "development",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  watch: true,

  plugins: [
    new liveReload()
  ],
});
