import fs from 'fs-extra';
import { Folder } from '../interfaces/Folder.interface';

export const copyDir = async (dir: Folder): Promise<void> => {
  try {
    fs.copySync(dir.sourcePath, dir.destinationPath, {
      overwrite: true,
      recursive: true,
    });
    console.info('Dir has been copied');
  } catch (err) {
    console.info(`${err} has found`);
  }
};
