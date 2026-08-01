const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/preload/index.ts',
  target: 'electron-preload',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '../dist/preload'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@shared': path.resolve(__dirname, '../src/shared')
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: {
    electron: 'commonjs electron'
  }
};