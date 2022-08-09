import { Folder } from '../../interfaces/Folder.interface';

export const ExtensionFolders: Folder[] = [
  {
    sourcePath: 'buffer/opera',
    type: 'opera_dir_init',
    destinationPath: 'extension/opera',
  },
  {
    sourcePath: 'buffer/chrome',
    type: 'chrome_dir_init',
    destinationPath: 'extension/chrome',
  },
  {
    sourcePath: 'buffer/firefox',
    type: 'firefox_dir_init',
    destinationPath: 'extension/firefox',
  },
  {
    sourcePath: 'buffer/edge',
    type: 'edge_dir_init',
    destinationPath: 'extension/edge',
  },
  {
    sourcePath: 'dist/chrome',
    type: 'chrome_dir_update',
    destinationPath: 'extension/chrome',
  },
  {
    sourcePath: 'dist/opera',
    type: 'opera_dir_update',
    destinationPath: 'extension/opera',
  },
  {
    sourcePath: 'dist/firefox',
    type: 'firefox_dir_update',
    destinationPath: 'extension/firefox',
  },
  {
    sourcePath: 'dist/edge',
    type: 'edge_dir_update',
    destinationPath: 'extension/edge',
  },
];
