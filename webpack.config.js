import 'dotenv-flow/config.js';

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import PlatformPlugin from './scripts/PlatformPlugin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    ignoreWarnings: [/Failed to parse source map/],
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
          test: /\.(css|js)$/,
          enforce: 'pre',
          use: ['source-map-loader'],
        },
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
                  exportLocalsConvention: 'dashesOnly',
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
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_DEBUG': 'undefined',
        'process.env.NODE_ENV': JSON.stringify(mode),
        __AMPLITUDE_API_KEY__: JSON.stringify(process.env.AMPLITUDE_API_KEY),
        __MIXPANEL_TOKEN__: JSON.stringify(process.env.MIXPANEL_TOKEN),
        __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN),
        __SENTRY_ENVIRONMENT__: JSON.stringify(process.env.SENTRY_ENVIRONMENT),
        __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE),
      }),
      new MiniCssExtractPlugin({ ignoreOrder: true }),
      new PlatformPlugin({ clear: !dev }),
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

export default async (_, { mode }) => [
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
        chunks: ['vendors', 'popup'],
        hash: true,
      }),
      new HtmlWebpackPlugin({
        filename: 'notification.html',
        chunks: ['vendors', 'popup'],
        hash: true,
      }),
      new HtmlWebpackPlugin({
        filename: 'accounts.html',
        chunks: ['vendors', 'accounts'],
        hash: true,
      }),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          defaultVendors: false,
          default: false,
          vendors: {
            priority: 10,
            test: /[\\/]node_modules[\\/]/,
            chunks: 'initial',
            name: (_module, chunks, cacheGroupKey) =>
              `${cacheGroupKey}-${chunks.map(chunk => chunk.name).join('&')}`,
          },
          common: {
            chunks: 'initial',
            minChunks: 2,
            name: (_module, chunks, cacheGroupKey) =>
              `${cacheGroupKey}-${chunks.map(chunk => chunk.name).join('&')}`,
          },
        },
      },
    },
  }),
];
