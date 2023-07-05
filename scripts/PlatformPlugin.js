import { mkdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import webpack from 'webpack';

import adaptManifestToPlatform from './adaptManifestToPlatform.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_FOLDER = path.resolve(__dirname, '..', 'dist');

export default class PlatformPlugin {
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
        readFile(path.resolve(__dirname, './platforms.json'), 'utf8')
          .then(JSON.parse)
          .then(platforms =>
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
                      2,
                    ),
                    'utf-8',
                  );
                } else {
                  await writeFile(platformFile, content);
                }
              }),
            ),
          ),
    );
  }
}
