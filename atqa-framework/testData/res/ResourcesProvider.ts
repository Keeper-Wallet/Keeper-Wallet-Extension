import path from 'path';
import fs from 'fs-extra';

import { File } from '../../interfaces/File.interface';
import { Folder } from '../../interfaces/Folder.interface';
import { SeedsPhrases } from '../../interfaces/SeedsPhrase.interface';
import { ResourcesObjects } from './resourcesObjects';
import { ExtensionFolders } from './folderObjects';
import { SeedObjects } from './SeedsObjects';

export class ResourcesProvider {
  private getFileResources = [...ResourcesObjects];

  private getFolderResources = [...ExtensionFolders];

  private getSeedResource = [...SeedObjects];

  private getFileResource = (resourceType: string): File => {
    const initFile = this.getFileResources.find(
      (file) => file.type === resourceType
    );
    if (initFile === undefined) {
      throw new Error(`The ${initFile} is undefined`);
    }
    return initFile;
  };

  private getFolderResource = (folderType: string): Folder => {
    const initResource = this.getFolderResources.find(
      (folder) => folder.type === folderType
    );
    if (initResource === undefined) {
      throw new Error(`The ${initResource} is undefined`);
    }
    return initResource;
  };

  private getSeed = (seedType: string): SeedsPhrases => {
    const initResource = this.getSeedResource.find(
      (seed) => seed.networkType === seedType
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

  getCustomSeed = (seedType: string): SeedsPhrases => {
    const seed = this.getSeed(seedType);
    return {
      address: seed.address,
      phrase: seed.phrase,
    };
  };

  getKeystore = async (file: string): Promise<File> => {
    return this.getFileResource(file);
  };

  getManifestFile = async (fileType: string): Promise<File> => {
    const manifest = this.getFileResource(fileType);
    const srcPath = path.basename(manifest.path);
    const buffer = await fs.readFile(manifest.path);
    return {
      path: srcPath,
      buffer,
    };
  };

  prepareInitDir = (dirType: string): Folder => {
    const dir = this.getFolderResource(dirType);
    const srcPath = path.join(__dirname, '..', '..', dir.sourcePath);
    const dstPath = path.join(__dirname, '..', '..', dir.destinationPath);
    return {
      sourcePath: srcPath,
      destinationPath: dstPath,
    };
  };

  prepareUpdateDir = (dirType: string): Folder => {
    const dir = this.getFolderResource(dirType);
    const srcPath = path.join(__dirname, '..', '..', '..', dir.sourcePath);
    const dstPath = path.join(__dirname, '..', '..', dir.destinationPath);
    return {
      sourcePath: srcPath,
      destinationPath: dstPath,
    };
  };
}
