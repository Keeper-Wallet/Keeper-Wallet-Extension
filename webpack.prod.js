const webpack = require('webpack');
const { mergeWithCustomize, customizeArray } = require('webpack-merge');
const common = require('./webpack.common.js');
const getVersion = require('./scripts/getVersion');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PlatformPlugin = require('./scripts/PlatformPlugin');

module.exports = () => {
  const version = getVersion();

  if (!version) {
    throw 'Build failed';
  }

  return mergeWithCustomize({
    customizeArray: customizeArray({
      'module.*': 'append',
      plugins: 'append',
    }),
  })(common, {
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.styl/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]-[local]-[hash:base64:6]',
                },
              },
            },
            'stylus-loader',
          ],
        },
        {
          test: /\.css/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]-[local]-[hash:base64:6]',
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production'),
        __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN),
        __SENTRY_ENVIRONMENT__: JSON.stringify(process.env.SENTRY_ENVIRONMENT),
        __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE),
      }),
      new MiniCssExtractPlugin(),
      new PlatformPlugin({
        platforms: ['chrome', 'firefox', 'opera', 'edge'],
        version,
        compress: true,
        performance: true,
      }),
    ],
  });
};
