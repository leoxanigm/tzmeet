const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: path.resolve(__dirname, 'src/client/'),
  mode: 'production',
  entry: {
    tzmeet: { import: './js/index.js', filename: 'js/[name].bundle.js' },
    style: { import: './css/index.css', filename: 'css/[name].bundle.js' },
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'public'),
    assetModuleFilename: 'img/[name][ext]',
    clean: true,
  },
  // devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
        type: 'asset/resource',
      },
    ],
  },
  optimization: {
    minimizer: ['...', new CSSMinimizerPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'img', to: 'img' },
        { from: 'favicon.ico', to: 'favicon.ico' },
      ],
    }),
    new CSSMinimizerPlugin(),
  ],
};
