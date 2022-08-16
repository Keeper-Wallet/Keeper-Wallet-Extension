import { File } from '../interfaces/File.interface';
import { Locator } from '../interfaces/Locator.interface';

const { I } = inject();

export const uploadFile = async (
  element: Locator,
  file: File
): Promise<void> => {
  I.attachFile(element, file.path);
};
