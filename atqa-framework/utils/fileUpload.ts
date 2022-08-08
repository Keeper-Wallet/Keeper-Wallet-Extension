import { UploadFile } from '../interfaces/UploadFile.interface';
import { Locator } from '../interfaces/Locator.interface';

const { I } = inject();

export const uploadFile = async (
  element: Locator,
  file: UploadFile
): Promise<void> => {
  I.attachFile(element, file.path);
};
