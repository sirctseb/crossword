const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const StyleLintPlugin = require('stylelint-webpack-plugin');

const StyleLintPluginConfig = new StyleLintPlugin();

module.exports = merge(common, {
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    StyleLintPluginConfig,
  ],
  devServer: {
    port: 7000,
    historyApiFallback: true,
    contentBase: './dist',
  },
});
