const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const distFolder = path.join(__dirname, "/dist");
const testFolder = path.join(__dirname, "/test");

 module.exports = merge(common, {
   mode: 'development',
   devtool: 'inline-source-map',
   devServer: {
     historyApiFallback: true,
     hot: false,
     inline: true,
     index: "index.html",
     port: 8020
   },
   plugins: [
     new HtmlWebpackPlugin({
       alwaysWriteToDisk: true,
       filename: path.resolve(distFolder, "index.html"),
       template: path.resolve(testFolder, "index.ejs"),
       inject: false,
       hash: true
     }),
     new CopyPlugin([
       { from: testFolder, to: distFolder }
     ])
   ]
});
