export const signArtDApp = '3PDBLdsUrcsiPxNbt8g2gQVoefKgzt3kJzV';
const signArtUserDApp = '3PGSWDgad4RtceQYXBpq2x73mXLRJYLRqRP';

export const signArtDataUrl = (nodeUrl: string) =>
  new URL(`addresses/data/${signArtDApp}`, nodeUrl).toString();
export const signArtUserDataUrl = (nodeUrl: string) =>
  new URL(`addresses/data/${signArtUserDApp}`, nodeUrl).toString();
