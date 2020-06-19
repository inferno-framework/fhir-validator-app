const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const liveReload = require('webpack-livereload-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: "development",

  devServer: {
    port: 4567,
    historyApiFallback: true,
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  watch: true,

  plugins: [
    new liveReload(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      filename: 'index.html',
    }),
  ],
});
