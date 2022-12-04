require('dotenv-flow/config');
const path = require('node:path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const PlatformPlugin = require('./scripts/PlatformPlugin');

async function makeConfig({
  entry,
  hmr,
  mode,
  name,
  optimization,
  plugins,
  reactRefresh,
  target,
}) {
  const dev = mode === 'development';

  const { TinyBrowserHmrWebpackPlugin } = await import(
    '@faergeek/tiny-browser-hmr-webpack-plugin'
  );

  return {
    name,
    target,
    devtool: dev ? 'cheap-module-source-map' : 'source-map',
    stats: 'errors-warnings',
    entry: Object.fromEntries(
      Object.entries(entry).map(([key, value]) => [
        key,
        [
          dev && hmr && '@faergeek/tiny-browser-hmr-webpack-plugin/client',
          ...(Array.isArray(value) ? value : [value]),
        ].filter(Boolean),
      ])
    ),
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      extensions: ['.ts', '.tsx', '.js'],
      fallback: {
        stream: 'stream-browserify',
      },
    },
    output: {
      assetModuleFilename: 'assets/[hash][ext]',
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist/build'),
      publicPath: './',
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.(js|tsx?)$/,
          include: path.resolve(__dirname, 'src'),
          use: {
            loader: 'babel-loader',
            options: {
              plugins:
                dev && hmr && reactRefresh ? ['react-refresh/babel'] : [],
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
        {
          test: /\.(gif|png|jpe?g|svg|webp|woff2)$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      process.stdout.isTTY && new webpack.ProgressPlugin(),
      dev && hmr && new webpack.HotModuleReplacementPlugin(),
      dev && hmr && new TinyBrowserHmrWebpackPlugin({ hostname: 'localhost' }),
      dev &&
        hmr &&
        reactRefresh &&
        new ReactRefreshWebpackPlugin({ overlay: false }),
      !dev &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          defaultSizes: 'gzip',
          generateStatsFile: true,
          openAnalyzer: false,
          reportFilename: path.resolve(
            __dirname,
            `dist/webpack-bundle-analyzer/${name}.html`
          ),
          statsFilename: path.resolve(__dirname, `dist/stats/${name}.json`),
        }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(mode),
        __AMPLITUDE_API_KEY__: JSON.stringify(process.env.AMPLITUDE_API_KEY),
        __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN),
        __SENTRY_ENVIRONMENT__: JSON.stringify(process.env.SENTRY_ENVIRONMENT),
        __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE),
      }),
      new MiniCssExtractPlugin(),
      new PlatformPlugin({
        clear: !dev,
        performance: !dev,
      }),
    ]
      .concat(plugins)
      .filter(Boolean),
    optimization: {
      ...optimization,
      minimizer: [
        '...',
        new CssMinimizerPlugin({
          minify: CssMinimizerPlugin.lightningCssMinify,
        }),
      ],
    },
  };
}

module.exports = async (_, { mode }) => [
  await makeConfig({
    mode,
    name: 'background',
    target: 'webworker',
    entry: {
      background: './src/background',
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, 'src/copied'),
            to: path.resolve(__dirname, 'dist/build'),
          },
        ],
      }),
    ],
  }),
  await makeConfig({
    mode,
    name: 'contentscript',
    entry: {
      contentscript: './src/contentscript',
      inpage: './src/inpage',
    },
  }),
  await makeConfig({
    mode,
    name: 'ui',
    hmr: true,
    reactRefresh: true,
    entry: {
      accounts: './src/accounts',
      popup: './src/popup',
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'popup.html',
        chunks: ['commons', 'popup'],
        hash: true,
      }),
      new HtmlWebpackPlugin({
        filename: 'notification.html',
        chunks: ['commons', 'popup'],
        hash: true,
      }),
      new HtmlWebpackPlugin({
        filename: 'accounts.html',
        chunks: ['commons', 'accounts'],
        hash: true,
      }),
    ],
    optimization: {
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
  }),
];
