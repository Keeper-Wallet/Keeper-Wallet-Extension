import fs from 'fs-extra';
import { Folder } from '../interfaces/Folder.interface';

export const copyDir = (dirSrc: Folder, dirDest: Folder): void => {
  try {
    fs.copySync(dirSrc.path, dirDest.bufferPath, {
      overwrite: true,
      recursive: true,
    });
    console.log('Dir has been copied');
  } catch (err) {
    console.log(`${err} has found`);
  }
};
