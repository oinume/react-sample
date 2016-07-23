const webpack = require('webpack');
const path = require('path');
const buildPath = path.resolve(__dirname, 'dest');
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  //Entry points to the project
  entry: [
    'webpack/hot/dev-server',
    'webpack/hot/only-dev-server',
    path.join(__dirname, '/src/app.jsx'),
  ],
  //Config options on how to interpret requires imports
  resolve: {
    extensions: ["", ".js"],
    //node_modules: ["web_modules", "node_modules"]  (Default Settings)
  },
  //Server Configuration options
  devServer: {
    contentBase: '',  // Relative directory for base of server
    devtool: 'eval',
    hot: true,        // Live-reload
    inline: true,
    port: 7001,
    host: '0.0.0.0',  //Change to '0.0.0.0' for external facing server
  },
  devtool: 'eval',
  output: {
    path: buildPath,    //Path of output file
    publicPath: "/",
    filename: 'app.js',
  },
  plugins: [
    //Enables Hot Modules Replacement
    new webpack.HotModuleReplacementPlugin(),
    //Allows error warnings but does not stop compiling. Will remove when eslint is added
    new webpack.NoErrorsPlugin(),
    new CopyWebpackPlugin([
      {
        context: 'src',
        from: '**/*.html',
        to: buildPath,
      }
    ]),
  ],
  module: {
    loaders: [
      {
        //React-hot loader and
        test: /\.jsx?$/,  //All .js files
        loaders: ['react-hot', 'babel-loader'], //react-hot is like browser sync and babel loads jsx and es6-7
        // query: {
        //   presets: ['react', 'es2015']
        // },
        exclude: [nodeModulesPath]
      },
    ],
  },
};

module.exports = config;
