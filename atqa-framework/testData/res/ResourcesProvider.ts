import { UploadFile } from '../../interfaces/UploadFile.interface';
import { Folder } from '../../interfaces/Folder.interface';
import { SeedsPhrases } from '../../interfaces/SeedsPhrase.interface';
import { ResourcesObjects } from './resourcesObjects';
import { ExtensionFolders } from './folderObjects';
import { SeedObjects } from './SeedsObjects';
import path from 'path';

export class ResourcesProvider {
  private getFileResources = [...ResourcesObjects];
  private getFolderResources = [...ExtensionFolders];
  private getSeedResource = [...SeedObjects];

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

  private getSeed = (seedType: string): SeedsPhrases => {
    const initResource = this.getSeedResource.find(
      seed => seed.networkType === seedType
    );
    if (initResource === undefined) {
      throw new Error(`The ${initResource} is undefined`);
    }
    return initResource;
  };

  getTestNetSeed = (): SeedsPhrases => {
    const seed = this.getSeed('TESTNET_SEED');
    return {
      address: seed.address,
      phrase: seed.phrase,
    };
  };

  getStageNetSeed = (): SeedsPhrases => {
    const seed = this.getSeed('STAGENET_SEED');
    return {
      address: seed.address,
      phrase: seed.phrase,
    };
  };

  getMainNetSeed = (): SeedsPhrases => {
    const seed = this.getSeed('MAINNET_SEED');
    return {
      address: seed.address,
      phrase: seed.phrase,
    };
  };

  getKeystore = async (file: string): Promise<UploadFile> => {
    return this.getFileResource(file);
  };

  prepareInitDir = async (dirType: string): Promise<Folder> => {
    const dir = this.getFolderResource(dirType);
    const srcPath = path.join(__dirname, '..', '..', dir.sourcePath);
    const dstPath = path.join(__dirname, '..', '..', dir.destinationPath);
    return {
      sourcePath: srcPath,
      destinationPath: dstPath,
    };
  };

  prepareUpdateDir = async (dirType: string): Promise<Folder> => {
    const dir = this.getFolderResource(dirType);
    const srcPath = path.join(__dirname, '..', '..', '..', dir.sourcePath);
    const dstPath = path.join(__dirname, '..', '..', dir.destinationPath);
    return {
      sourcePath: srcPath,
      destinationPath: dstPath,
    };
  };
}
