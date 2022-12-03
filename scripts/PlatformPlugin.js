const fs = require('fs/promises');
const path = require('path');
const webpack = require('webpack');
const del = require('del');
const updateManifest = require('./updateManifest');
const platforms = require('./platforms.json');

const DIST_FOLDER = path.resolve(__dirname, '..', 'dist');

module.exports = class PlatformPlugin {
  constructor({ clear, performance }) {
    this.clear = clear;
    this.performance = performance;
  }

  apply(compiler) {
    if (this.clear) {
      compiler.hooks.beforeCompile.tapPromise('ClearDist', () =>
        del(DIST_FOLDER)
      );
    }

    function report(message) {
      const reportProgress = webpack.ProgressPlugin.getReporter(compiler);

      if (!reportProgress) {
        return;
      }

      // first argument is unused according to docs
      // https://webpack.js.org/api/plugins/#reporting-progress
      reportProgress(0.95, message);
    }

    compiler.hooks.assetEmitted.tapPromise(
      'CopyAssetToPlatformFolder',
      (file, { content }) =>
        Promise.all(
          platforms.map(async platformName => {
            report(`copying ${file} to ${platformName}`);
            const platformFolder = path.resolve(DIST_FOLDER, platformName);
            const platformFile = path.join(platformFolder, file);
            const platformDir = path.dirname(platformFile);

            await fs.mkdir(platformDir, { recursive: true });

            if (file === 'manifest.json') {
              await updateManifest(content, platformName, platformFile);
            } else {
              await fs.writeFile(platformFile, content);
            }
          })
        )
    );

    if (this.performance) {
      compiler.hooks.done.tap('PerformanceSize', ({ compilation }) => {
        Object.entries(compilation.assets).forEach(([name, source]) => {
          if (name.endsWith('.js') && source.size() > 4000000) {
            throw new Error(`${name} is larger than 4 MB`);
          }
        });
      });
    }
  }
};
