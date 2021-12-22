const path = require('path');
const webpack = require('webpack');
const metaConf = require('./meta.conf');
const WebpackCustomActions = require('./WebpackCustomActionsPlugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const copyFiles = require('./copyFiles');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const getLocales = require('./lokalise');

module.exports = ({
  version,
  DIST,
  LANGS,
  PAGE_TITLE,
  PLATFORMS,
  isProduction,
}) => {
  const SOURCE_FOLDER = path.resolve(__dirname, '../', 'src');
  const DIST_FOLDER = path.resolve(__dirname, '../', DIST);
  const BUILD_FOLDER = path.resolve(DIST_FOLDER, 'build');
  const COPY = [
    {
      from: path.join(SOURCE_FOLDER, 'copied'),
      to: BUILD_FOLDER,
      ignore: [],
    },
  ];

  const getPlatforms = () => {
    const platformsConfig = metaConf(BUILD_FOLDER, DIST_FOLDER, version);
    let counter = PLATFORMS.length;
    PLATFORMS.forEach(platform => {
      copyFiles(platform, platformsConfig[platform], isProduction, () => {
        counter--;
        if (isProduction && counter === 0) {
          console.log('-= Build AppX for Edge =-');
          require('./edgeExt');
          console.log('-= Build AppX for Edge ended =-');
        }
      });
    });
  };

  const plugins = [];

  if (process.stdout.isTTY) {
    plugins.push(new webpack.ProgressPlugin());
  }

  plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    })
  );

  plugins.push(new CopyWebpackPlugin(COPY));

  plugins.push(
    new ExtractTextPlugin({ filename: 'index.css', allChunks: true })
  );

  plugins.push(
    new HtmlWebpackPlugin({
      title: PAGE_TITLE,
      filename: 'popup.html',
      template: path.resolve(SOURCE_FOLDER, 'popup.html'),
      hash: true,
      excludeChunks: ['background', 'contentscript', 'inpage'],
    })
  );

  plugins.push(
    new HtmlWebpackPlugin({
      title: PAGE_TITLE,
      filename: 'notification.html',
      template: path.resolve(SOURCE_FOLDER, 'notification.html'),
      hash: true,
      excludeChunks: ['background', 'contentscript', 'inpage'],
    })
  );
  plugins.push(
    new WebpackCustomActions({
      onBuildStart: [() => getLocales(LANGS, 'src/copied/_locales')],
    })
  );

  plugins.push(new WebpackCustomActions({ onBuildEnd: [getPlatforms] }));

  return {
    stats: 'errors-warnings',
    entry: {
      ui: path.resolve(SOURCE_FOLDER, 'ui'),
      background: path.resolve(SOURCE_FOLDER, 'background'),
      contentscript: path.resolve(SOURCE_FOLDER, 'contentscript'),
      inpage: path.resolve(SOURCE_FOLDER, 'inpage'),
    },
    output: {
      filename: '[name].js',
      path: BUILD_FOLDER,
      publicPath: './',
    },

    resolve: {
      plugins: [
        new TsConfigPathsPlugin({
          /*configFile: "./path/to/tsconfig.json" */
        }),
      ],
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        '@waves/waves-transactions': path.resolve(
          __dirname,
          '../node_modules/@waves/waves-transactions'
        ),
      },
    },

    plugins,

    module: {
      rules: [
        {
          test: /\.(png|jpg|svg|gif)$/,
          loader: 'url-loader?limit=1000&name=assets/img/[name].[ext]',
        },

        {
          test: /\.(woff|woff2|ttf|otf)$/,
          loader: 'file-loader?name=assets/fonts/[name].[ext]',
        },
        {
          test: /\.tsx?$/,
          loader: 'babel-loader!awesome-typescript-loader?transpileOnly',
          exclude: /node_modules/,
        },
        {
          test: /\.(jsx?)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /obs-store/,
          loader: 'babel-loader',
        },
        {
          test: /\.styl/,
          exclude: [/node_modules/],
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              'css-loader?modules,localIdentName="[name]-[local]-[hash:base64:6]"',
              'stylus-loader',
            ],
          }),
        },
        {
          test: /\.css/,
          oneOf: [
            {
              test: /\.module\.css$/,
              loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [
                  'css-loader?modules,localIdentName="[name]-[local]-[hash:base64:6]"',
                ],
              }),
            },
            {
              loader: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: ['css-loader'],
              }),
            },
          ],
        },
      ],
    },
  };
};
