const path = require('path');
const webpack = require('webpack');
const getVersion = require('./scripts/getVersion');
const svgToMiniDataURI = require('mini-svg-data-uri');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const PlatformPlugin = require('./scripts/PlatformPlugin');

module.exports = async (_, { mode }) => {
  const version = getVersion();

  if (!version) {
    throw new Error('Build failed');
  }

  const dev = mode === 'development';

  const { TinyBrowserHmrWebpackPlugin } = await import(
    '@faergeek/tiny-browser-hmr-webpack-plugin'
  );

  return {
    entry: {
      popup: (dev
        ? ['@faergeek/tiny-browser-hmr-webpack-plugin/client']
        : []
      ).concat('./src/popup'),
      accounts: (dev
        ? ['@faergeek/tiny-browser-hmr-webpack-plugin/client']
        : []
      ).concat('./src/accounts'),
      background: './src/background',
      contentscript: './src/contentscript',
      inpage: './src/inpage',
    },
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
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
    devtool: dev ? 'cheap-module-source-map' : 'source-map',
    stats: 'errors-warnings',
    optimization: {
      minimizer: [
        '...',
        new CssMinimizerPlugin({
          minify: CssMinimizerPlugin.lightningCssMinify,
        }),
      ],
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'commons',
            test: /.js$/,
            maxSize: 4000000,
            chunks: chunk => ['popup', 'accounts'].includes(chunk.name),
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
          use: {
            loader: 'babel-loader',
            options: {
              plugins: dev ? ['react-refresh/babel'] : [],
            },
          },
        },
        {
          test: /obs-store/,
          use: 'babel-loader',
        },
        {
          test: /\.(css|styl)$/,
          use: {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) =>
                `${path.relative(path.dirname(resourcePath), context)}/`,
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  exportLocalsConvention: 'dashesOnly',
                  localIdentName: '[local]@[name]#[contenthash:base64:5]',
                  namedExport: true,
                },
              },
            },
          ],
        },
        {
          test: /\.styl$/,
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[local]@[name]#[contenthash:base64:5]',
                  namedExport: true,
                },
              },
            },
          ],
        },
        { test: /\.(css|styl)$/, use: 'postcss-loader' },
        { test: /\.styl/, use: 'stylus-loader' },
      ],
    },
    plugins: (process.stdout.isTTY ? [new webpack.ProgressPlugin()] : [])
      .concat(
        dev
          ? [
              new webpack.HotModuleReplacementPlugin(),
              new TinyBrowserHmrWebpackPlugin({ hostname: 'localhost' }),
              new ReactRefreshWebpackPlugin({ overlay: false }),
            ]
          : [
              new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                defaultSizes: 'gzip',
                generateStatsFile: true,
                openAnalyzer: false,
                reportFilename: path.resolve(
                  __dirname,
                  'dist/webpack-bundle-analyzer.html'
                ),
                statsFilename: path.resolve(__dirname, 'dist/stats.json'),
              }),
            ]
      )
      .concat([
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
          chunks: ['commons', 'popup'],
        }),
        new HtmlWebpackPlugin({
          title: 'Keeper Wallet',
          filename: 'notification.html',
          template: path.resolve(__dirname, 'src/notification.html'),
          hash: true,
          chunks: ['commons', 'popup'],
        }),
        new HtmlWebpackPlugin({
          title: 'Keeper Wallet',
          filename: 'accounts.html',
          template: path.resolve(__dirname, 'src/accounts.html'),
          hash: true,
          chunks: ['commons', 'accounts'],
        }),
        new webpack.NormalModuleReplacementPlugin(
          /@sentry\/browser\/esm\/helpers.js/,
          path.resolve(__dirname, 'src/_sentryHelpersReplacement.js')
        ),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(mode),
          __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN),
          __SENTRY_ENVIRONMENT__: JSON.stringify(
            process.env.SENTRY_ENVIRONMENT
          ),
          __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE),
        }),
        new MiniCssExtractPlugin(),
        new PlatformPlugin({
          platforms: ['chrome', 'firefox', 'opera', 'edge'],
          version,
          clear: !dev,
          compress: !dev,
          performance: !dev,
        }),
      ]),
  };
};
