import { BasePage } from './BasePage';

export class ExtensionInitPage extends BasePage {
  SELECTORS = {
    CHROMIUM: {
      EXTENSION_ID: {
        shadow: [
          'extensions-manager',
          'extensions-detail-view',
          '#id-section > div:nth-of-type(2)',
        ],
      },
    },
    EDGE: {
      EXTENSION_ID: {
        css: '[role=main] > div > div:nth-of-type(2) > div > div:nth-of-type(6) > div > p:nth-of-type(2) > span',
      },
    },
    FIREFOX: {
      EXTENSION_ID: { xpath: '(//dl/div[contains(., "UUID")]/dd)[1]' },
    },
  };
}
