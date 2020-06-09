const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(common, {
  mode: "production",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  plugins: [
    new CleanWebpackPlugin(),
  ],

  optimization: {
    removeAvailableModules: true,
    removeEmptyChunks: true,
    usedExports: true
  },

  output: {
    filename: '[name].[contenthash].js'
  }
});
