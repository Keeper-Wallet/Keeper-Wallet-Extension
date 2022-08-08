import { Folder } from '../../interfaces/Folder.interface';

export const ExtensionFolders: Folder[] = [
  {
    path: 'dist/opera',
    type: 'opera_dir',
    bufferPath: 'extension/chrome',
  },
  {
    path: 'dist/chrome',
    type: 'chrome_dir',
    bufferPath: 'extension/opera',
  },
  {
    path: 'dist/firefox',
    type: 'firefox_dir',
    bufferPath: 'extension/firefox',
  },
  {
    path: 'dist/edge',
    type: 'edge_dir',
    bufferPath: 'extension/edge',
  },
  {
    path: 'atqa-framework/extension',
    type: 'buffer_dir',
    bufferPath: 'extension/chrome',
  },
];
