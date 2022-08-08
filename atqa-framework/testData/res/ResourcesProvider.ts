import { UploadFile } from '../../interfaces/UploadFile.interface';
import { Folder } from '../../interfaces/Folder.interface';
import { ResourcesObjects } from './resourcesObjects';
import { ExtensionFolders } from './folderObjects';
import path from 'path';

export class ResourcesProvider {
  private getFileResources = [...ResourcesObjects];
  private getFolderResources = [...ExtensionFolders];

  private getFileResource = (resourceType: string): UploadFile => {
    const initFile = this.getFileResources.find(
      file => file.type === resourceType
    );
    if (initFile === undefined) {
      throw new Error(`The ${initFile} is undefined`);
    }
    return initFile;
  };

  private getFolderResource = (folderType: string): Folder => {
    const initResource = this.getFolderResources.find(
      folder => folder.type === folderType
    );
    if (initResource === undefined) {
      throw new Error(`The ${initResource} is undefined`);
    }
    return initResource;
  };

  uploadObject = async (file: string): Promise<UploadFile> => {
    const resource = this.getFileResource(file);
    const filePath = path.basename(resource.path);
    return {
      path: filePath,
    };
  };

  prepareDir = async (dirType: string): Promise<Folder> => {
    const dir = this.getFolderResource(dirType);
    const srcPath = path.join(__dirname, '..', '..', '..', dir.path);
    const dstPath = path.join(__dirname, '..', '..', dir.bufferPath);
    return {
      path: srcPath,
      bufferPath: dstPath,
    };
  };
}
