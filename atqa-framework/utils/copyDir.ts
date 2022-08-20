import fs from 'fs-extra';
import { Folder } from '../interfaces/Folder.interface';

export const copyDir = async (dir: Folder): Promise<void> => {
  await fs.copy(dir.sourcePath, dir.destinationPath, {
    overwrite: true,
    recursive: true,
  });
};
