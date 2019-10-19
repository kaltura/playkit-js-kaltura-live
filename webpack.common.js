const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const distFolder = path.join(__dirname, "/dist");
const pluginName = 'kaltura-live';

module.exports = {
  entry: {
    [`playkit-js-${pluginName}`]: "./src/index.ts"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".scss", ".svg"],
    modules: [path.resolve(__dirname, "node_modules")],
    symlinks: false
  },
  output: {
    path: distFolder,
    filename: '[name].js',
    library: ['KalturaPlayer', 'plugins', pluginName],
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
      {
        test: /\.tsx?$/,
        loader: "awesome-typescript-loader"
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              camelCase: true,
              modules: true,
              localIdentName: 'contrib[name]__[local]___[hash:base64:5]'
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.svg/,
        use: {
          loader: 'svg-url-loader',
          options: {}
        }
      }
    ]
  },
  externals: {
    '@playkit-js/playkit-js': {
      commonjs: '@playkit-js/playkit-js',
      commonjs2: '@playkit-js/playkit-js',
      amd: 'playkit-js',
      root: ['KalturaPlayer', 'core']
    }
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
};
