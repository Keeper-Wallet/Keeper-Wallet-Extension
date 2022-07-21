const path = require('path');
const webpack = require('webpack');
const svgToMiniDataURI = require('mini-svg-data-uri');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: {
    ui: path.resolve(__dirname, 'src/ui'),
    'accounts/ui': path.resolve(__dirname, 'src/accounts/ui'),
    background: path.resolve(__dirname, 'src/background'),
    contentscript: path.resolve(__dirname, 'src/contentscript'),
    inpage: path.resolve(__dirname, 'src/inpage'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/build'),
    publicPath: './',
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), './node_modules'],
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      stream: require.resolve('stream-browserify'),
    },
  },
  stats: 'errors-warnings',
  performance: {
    maxAssetSize: 4000000,
  },
  optimization: {
    minimizer: ['...', new CssMinimizerPlugin()],
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          test: /.js$/,
          maxSize: 4000000,
          chunks: chunk => ['ui', 'accounts/ui'].includes(chunk.name),
        },
      },
    },
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.svg$/,
        type: 'asset',
        generator: {
          filename: 'assets/img/[name].[ext]',
          dataUrl: content => svgToMiniDataURI(content.toString()),
        },
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        type: 'asset',
        generator: {
          filename: 'assets/img/[name].[ext]',
        },
      },
      {
        test: /\.(woff2?|ttf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[ext]',
        },
      },
      {
        test: /\.(js|tsx?)$/,
        include: path.resolve(__dirname, 'src'),
        use: 'babel-loader',
      },
      {
        test: /obs-store/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/copied'),
          to: path.resolve(__dirname, 'dist/build'),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      title: 'Keeper Wallet',
      filename: 'popup.html',
      template: path.resolve(__dirname, 'src/popup.html'),
      hash: true,
      chunks: ['commons', 'ui'],
    }),
    new HtmlWebpackPlugin({
      title: 'Keeper Wallet',
      filename: 'notification.html',
      template: path.resolve(__dirname, 'src/notification.html'),
      hash: true,
      chunks: ['commons', 'ui'],
    }),
    new HtmlWebpackPlugin({
      title: 'Keeper Wallet',
      filename: 'accounts.html',
      template: path.resolve(__dirname, 'src/accounts.html'),
      hash: true,
      chunks: ['commons', 'accounts/ui'],
    }),
    new webpack.NormalModuleReplacementPlugin(
      /@sentry\/browser\/esm\/helpers.js/,
      path.resolve(__dirname, 'src/_sentryHelpersReplacement.js')
    ),
  ].concat(process.stdout.isTTY ? [new webpack.ProgressPlugin()] : []),
};
