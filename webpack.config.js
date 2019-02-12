const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');
const config = require('./server/constants/config');
const path = require('path');

const plugins = [];
const isProd = config.ENVIRONMENT == 'production';

if (isProd) {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new CompressionPlugin({
      asset: '[path].gz'
    })
  );
}

module.exports = {
  mode: config.ENVIRONMENT,

  entry: {
    Pay: './web/components/Pay.jsx'
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'server/static/js')
  },

  resolve: {
    modules: [path.resolve(__dirname, 'web'), 'node_modules'],
    alias: {
      server: __dirname
    },
    extensions: ['.js', '.jsx']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [path.resolve(__dirname, 'web')],
        exclude: /node_modules/,
        options: {
          presets: ['env', 'react']
        }
      }
    ]
  },

  plugins
};
