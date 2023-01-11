const { mkdir, writeFile } = require('node:fs/promises');
const path = require('node:path');
const webpack = require('webpack');
const adaptManifestToPlatform = require('./adaptManifestToPlatform');
const platforms = require('./platforms.json');

const DIST_FOLDER = path.resolve(__dirname, '..', 'dist');

module.exports = class PlatformPlugin {
  constructor({ clear }) {
    this.clear = clear;
  }

  apply(compiler) {
    if (this.clear) {
      compiler.hooks.beforeCompile.tapPromise('ClearDist', async () => {
        const { deleteAsync } = await import('del');

        await deleteAsync(DIST_FOLDER);
      });
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

            await mkdir(platformDir, { recursive: true });

            if (file === 'manifest.json') {
              await writeFile(
                platformFile,
                JSON.stringify(
                  adaptManifestToPlatform(content, platformName),
                  null,
                  2
                ),
                'utf-8'
              );
            } else {
              await writeFile(platformFile, content);
            }
          })
        )
    );
  }
};
