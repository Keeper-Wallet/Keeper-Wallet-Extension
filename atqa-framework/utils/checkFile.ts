import fs from 'fs-extra';
import { File } from '../interfaces/File.interface';
import { ClockUnit } from './clockUnit';

const clockUnit = new ClockUnit();

export const checkFile = async (file: File): Promise<void> => {
  setTimeout(() => {
    try {
      fs.existsSync(file.path);
      console.log(`File is exist in init folder`);
    } catch (err) {
      console.log(`${err} is found`);
    }
  }, clockUnit.SECONDS * 30);
};
