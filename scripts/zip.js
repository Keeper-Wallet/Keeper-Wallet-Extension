import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { zip } from 'zip-a-folder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_FOLDER = path.resolve(__dirname, '..', 'dist');

readFile(path.resolve(__dirname, './platforms.json'), 'utf8')
  .then(JSON.parse)
  .then(platforms => {
    platforms.forEach(async platformName => {
      await zip(
        path.resolve(DIST_FOLDER, platformName),
        path.resolve(
          DIST_FOLDER,
          `keeper-wallet-${process.env.KEEPER_VERSION}-${platformName}.zip`,
        ),
      );
    });
  });
