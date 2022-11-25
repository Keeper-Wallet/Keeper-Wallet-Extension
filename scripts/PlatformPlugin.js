const path = require('path');
const webpack = require('webpack');
const { zip } = require('zip-a-folder');
const cpy = require('cpy');
const del = require('del');
const metaConf = require('./meta.conf');
const updateManifest = require('./updateManifest');

const DIST_FOLDER = path.resolve(__dirname, '../', 'dist');
const BUILD_FOLDER = path.resolve(DIST_FOLDER, 'build');

const MAX_ASSET_SIZE = 4000000;

module.exports = class PlatformPlugin {
  constructor({ platforms, version, clear, compress, performance }) {
    this.platforms = platforms;
    this.version = version;
    this.clear = clear;
    this.compress = compress;
    this.performance = performance;
  }

  apply(compiler) {
    if (this.clear) {
      compiler.hooks.beforeCompile.tapPromise('ClearDist', async () => {
        await del(DIST_FOLDER);
      });
    }

    compiler.hooks.afterEmit.tapPromise('AdaptExtension', async () => {
      function report(message) {
        const reportProgress = webpack.ProgressPlugin.getReporter(compiler);

        if (!reportProgress) {
          return;
        }

        // first argument is unused according to docs
        // https://webpack.js.org/api/plugins/#reporting-progress
        reportProgress(0.95, message);
      }

      const platformConfigs = metaConf(this.version);

      for (const platformName of this.platforms) {
        report(`copying build to ${platformName}`);
        const platformFolder = path.resolve(DIST_FOLDER, platformName);

        await cpy('**', platformFolder, {
          cwd: BUILD_FOLDER,
          parents: true,
        });

        updateManifest(
          path.resolve(BUILD_FOLDER, 'manifest.json'),
          platformConfigs[platformName].manifest,
          path.resolve(platformFolder, 'manifest.json')
        );

        if (this.compress) {
          const zipFilename = `keeper-wallet-${this.version}-${platformName}.zip`;

          report(`creating ${zipFilename}`);

          await zip(platformFolder, path.resolve(DIST_FOLDER, zipFilename));
        }
      }
    });

    if (this.performance) {
      compiler.hooks.done.tap('PerformanceSize', ({ compilation }) => {
        Object.entries(compilation.assets).forEach(([name, source]) => {
          if (name.endsWith('.js') && source.size() > MAX_ASSET_SIZE) {
            throw new Error(`${name} is larger than 4 MB`);
          }
        });
      });
    }
  }
};
