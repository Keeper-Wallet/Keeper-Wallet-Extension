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
      SERVICE_WORKER_RESTART_BUTTON: {
        shadow: [
          'extensions-manager',
          'extensions-detail-view',
          '#enable-section > div',
        ],
      },
      SERVICE_WORKER_ACTIVE: {
        shadow: [
          'extensions-manager',
          'extensions-detail-view',
          '#inspect-views > li > a',
        ],
      },
      SERVICE_WORKER_INACTIVE: {
        shadow: [
          'extensions-manager',
          'extensions-detail-view',
          '#inspect-views > li',
        ],
      },
    },
    EDGE: {
      EXTENSION_ID: {
        css: '[role=main] > div > div:nth-of-type(2) > div > div:nth-of-type(6) > div > p:nth-of-type(2) > span',
      },
      SERVICE_WORKER_ACTIVE: {
        xpath: '//span[contains(text(),"service worker")]',
      },
    },
    FIREFOX: {
      EXTENSION_ID: { xpath: '(//dl/div[contains(., "UUID")]/dd)[1]' },
    },
  };
}
