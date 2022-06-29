const FolderZip = require('folder-zip');
const ncp = require('ncp').ncp;
const path = require('path');
const webpack = require('webpack');
const metaConf = require('./meta.conf');
const WebpackCustomActions = require('./WebpackCustomActionsPlugin');
const { TsConfigPathsPlugin } = require('awesome-typescript-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const updateManifest = require('./updateManifest');

function ncpAsync(from, to) {
  return new Promise((resolve, reject) => {
    ncp(from, to, err => (err ? reject(err) : resolve()));
  });
}

function zipFolder(from, to) {
  return new Promise((resolve, reject) => {
    const zip = new FolderZip();

    zip.zipFolder(from, { excludeParentFolder: true }, err => {
      if (err) {
        return reject(err);
      }

      try {
        zip.writeToFileSync(to);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = ({ version, DIST, PAGE_TITLE, PLATFORMS, isProduction }) => {
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
    const platformsConfig = metaConf(version);

    PLATFORMS.reduce(async (prevPromise, platformName) => {
      await prevPromise;

      const platformFolder = path.join(DIST_FOLDER, platformName);
      await ncpAsync(BUILD_FOLDER, platformFolder);

      updateManifest(
        path.join(BUILD_FOLDER, 'manifest.json'),
        platformsConfig[platformName].manifest,
        path.join(platformFolder, 'manifest.json')
      );

      console.log(`Copying to ${platformName} is done`);

      if (isProduction) {
        await zipFolder(
          platformFolder,
          path.join(DIST_FOLDER, `keeper-wallet-${version}-${platformName}.zip`)
        );

        console.log(`Zipping ${platformName} is done`);
      }
    }, Promise.resolve());
  };

  const plugins = [];

  if (process.stdout.isTTY) {
    plugins.push(new webpack.ProgressPlugin());
  }

  plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN),
      __SENTRY_ENVIRONMENT__: JSON.stringify(process.env.SENTRY_ENVIRONMENT),
      __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE),
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
      chunks: ['commons', 'ui'],
    })
  );

  plugins.push(
    new HtmlWebpackPlugin({
      title: PAGE_TITLE,
      filename: 'notification.html',
      template: path.resolve(SOURCE_FOLDER, 'notification.html'),
      hash: true,
      chunks: ['commons', 'ui'],
    })
  );

  plugins.push(
    new HtmlWebpackPlugin({
      title: PAGE_TITLE,
      filename: 'accounts.html',
      template: path.resolve(SOURCE_FOLDER, 'accounts.html'),
      hash: true,
      chunks: ['commons', 'accounts/ui'],
    })
  );

  plugins.push(new WebpackCustomActions({ onBuildEnd: [getPlatforms] }));

  plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /@sentry\/browser\/esm\/helpers.js/,
      path.resolve(SOURCE_FOLDER, '_sentryHelpersReplacement.js')
    )
  );

  return {
    stats: 'errors-warnings',
    entry: {
      ui: path.resolve(SOURCE_FOLDER, 'ui'),
      'accounts/ui': path.resolve(SOURCE_FOLDER, 'accounts/ui'),
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
      alias: {
        long: 'long/index.js', // needed because webpack@^4 does not support package.json#exports yet
      },
      plugins: [
        new TsConfigPathsPlugin({
          /*configFile: "./path/to/tsconfig.json" */
        }),
      ],
      extensions: ['.ts', '.tsx', '.js'],
    },

    plugins,

    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'commons',
            chunks(chunk) {
              return ['ui', 'accounts/ui'].includes(chunk.name);
            },
          },
        },
      },
    },

    module: {
      rules: [
        {
          test: /\.(png|jpe?g|svg|gif)$/,
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
          exclude: /node_modules/,
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
