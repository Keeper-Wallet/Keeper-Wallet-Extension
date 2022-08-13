const path = require('path');
const webpack = require('webpack');
const getVersion = require('./scripts/getVersion');
const svgToMiniDataURI = require('mini-svg-data-uri');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PlatformPlugin = require('./scripts/PlatformPlugin');

module.exports = (_, { mode }) => {
  const version = getVersion();

  if (!version) {
    throw 'Build failed';
  }

  const isProduction = mode === 'production';

  return {
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
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    stats: 'errors-warnings',
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
          type: 'asset/resource',
          generator: {
            filename: 'assets/img/[name][ext]',
          },
        },
        {
          test: /\.(woff2?|ttf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name][ext]',
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
        {
          test: /\.styl/,
          use: [
            isProduction
              ? {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    publicPath: (resourcePath, context) => {
                      return (
                        path.relative(path.dirname(resourcePath), context) + '/'
                      );
                    },
                  },
                }
              : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]-[local]-[hash:base64:6]',
                  namedExport: true,
                },
              },
            },
            'stylus-loader',
          ],
        },
        {
          test: /\.css/,
          use: [
            isProduction
              ? {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    publicPath: (resourcePath, context) => {
                      return (
                        path.relative(path.dirname(resourcePath), context) + '/'
                      );
                    },
                  },
                }
              : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]-[local]-[hash:base64:6]',
                  namedExport: true,
                },
              },
            },
          ],
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
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN),
        __SENTRY_ENVIRONMENT__: JSON.stringify(process.env.SENTRY_ENVIRONMENT),
        __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE),
      }),
      new MiniCssExtractPlugin(),
      new PlatformPlugin({
        platforms: ['chrome', 'firefox', 'opera', 'edge'],
        version,
        clear: isProduction,
        compress: isProduction,
        performance: isProduction,
      }),
    ].concat(process.stdout.isTTY ? [new webpack.ProgressPlugin()] : []),
  };
};
