const FolderZip = require('folder-zip');
const cpy = require('cpy');
const del = require('del');
const path = require('path');
const webpack = require('webpack');
const metaConf = require('./meta.conf');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const updateManifest = require('./updateManifest');

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

  plugins.push(function () {
    this.hooks.beforeRun.tapPromise('ClearDist', async () => {
      await del([DIST_FOLDER]);
    });

    this.hooks.afterEmit.tapPromise(
      { name: 'AdaptExtension', context: true },
      async context => {
        function report(message) {
          const reportProgress = context && context.reportProgress;

          if (!reportProgress) {
            return;
          }

          // first argument is unused according to docs
          // https://v4.webpack.js.org/api/plugins/#reporting-progress
          reportProgress(0.95, message);
        }

        const platformConfigs = metaConf(version);

        for (const platformName of PLATFORMS) {
          report(`copying build to ${platformName}`);

          const platformFolder = path.join(DIST_FOLDER, platformName);

          await cpy('**', platformFolder, {
            cwd: BUILD_FOLDER,
            parents: true,
          });

          updateManifest(
            path.join(BUILD_FOLDER, 'manifest.json'),
            platformConfigs[platformName].manifest,
            path.join(platformFolder, 'manifest.json')
          );

          if (isProduction) {
            const zipFilename = `keeper-wallet-${version}-${platformName}.zip`;

            report(`creating ${zipFilename}`);

            await zipFolder(
              platformFolder,
              path.join(DIST_FOLDER, zipFilename)
            );
          }
        }
      }
    );
  });

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
      modules: [path.join(__dirname, '..', 'src'), 'node_modules'],
      extensions: ['.ts', '.tsx', '.js'],
    },

    plugins,

    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'commons',
            test: /.js$/,
            chunks(chunk) {
              return ['ui', 'accounts/ui'].includes(chunk.name);
            },
            maxSize: 4000000,
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
          test: /\.(js|tsx?)$/,
          include: SOURCE_FOLDER,
          loader: 'babel-loader',
        },
        {
          test: /obs-store/,
          loader: 'babel-loader',
        },
        {
          test: /\.styl/,
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
