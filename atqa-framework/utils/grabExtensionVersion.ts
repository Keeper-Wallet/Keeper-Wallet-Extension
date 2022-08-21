import { ExtensionInitPage } from '../tests/pages/ExtensionInitPage';

const extensionInitPage = new ExtensionInitPage();

const { I } = inject();

export const getChromeExtensionVersion = async (): Promise<string> => {
  I.waitForElement(extensionInitPage.SELECTORS.CHROMIUM.EXTENSION_VERSION);
  return I.grabTextFrom(extensionInitPage.SELECTORS.CHROMIUM.EXTENSION_VERSION);
};

export const getOperaExtensionVersion = async (): Promise<string> => {
  I.waitForElement(extensionInitPage.SELECTORS.OPERA.EXTENSION_VERSION);
  return I.grabTextFrom(extensionInitPage.SELECTORS.OPERA.EXTENSION_VERSION);
};

export const getEdgeExtensionVersion = async (): Promise<string> => {
  I.waitForElement(extensionInitPage.SELECTORS.EDGE.EXTENSION_VERSION);
  return I.grabTextFrom(extensionInitPage.SELECTORS.EDGE.EXTENSION_VERSION);
};
