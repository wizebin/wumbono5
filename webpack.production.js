var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var fs = require('fs');

var includePaths = [
  fs.realpathSync(__dirname + '/src'),
  fs.realpathSync(__dirname + '/shared'),
];

module.exports = {
  entry: __dirname + '/src/index.js',
  output: { path: __dirname + '/dist/web', filename: 'web_build.js' },

  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/src/index.html',
      inject: 'body',
      filename: 'index.html',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'BUILD_TARGET': JSON.stringify('web'),
        'NODE_ENV': JSON.stringify('production'),
      }
    }),
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      ioui: path.resolve(__dirname, 'shared/ui')
    },
    modules: [__dirname, 'node_modules'],
  },

  module: {
    loaders: [
      {
        test: /\.(jsx?)$/,
        loader: 'babel-loader',
        include: includePaths,
        query:
          {
            presets:['es2015', 'stage-0'],
          }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader?name=fonts/[name].[ext]'
      }
    ],
  },
};