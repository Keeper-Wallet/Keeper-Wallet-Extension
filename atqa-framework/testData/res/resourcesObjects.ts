import { File } from '../../interfaces/File.interface';

export const ResourcesObjects: File[] = [
  {
    path: './testData/res/data/keystore-wkeeper-2206221602.json',
    type: 'KEYSTORE',
  },
  {
    path: 'extension/chrome/manifest.json',
    type: 'MANIFEST_JSON_CHROME',
  },
  {
    path: 'extension/edge/manifest.json',
    type: 'MANIFEST_JSON_EDGE',
  },
  {
    path: 'extension/opera/manifest.json',
    type: 'MANIFEST_JSON_OPERA',
  },
  {
    path: 'package.json',
    type: 'PACKAGE_JSON',
  },
];
