import { BasePage } from './BasePage';
import { Locator } from '../../interfaces/Locator.interface';

export class ModalPage extends BasePage {
  SELECTORS = {
    KEEPER_CURRENT_VERSION: (currentVersion: string): Locator => ({
      xpath: `//div[@data-testid='currentVersion' and normalize-space()='v ${currentVersion}']`,
    }),
    KEEPER_PASSWORD_INPUT: '#loginPassword',
    SUBMIT_KEEPER_PASSWORD: '#loginEnter',
    SETTINGS_BUTTON: {
      css: '.height > div:nth-of-type(1) > div > div:nth-of-type(1)',
    },
    SETTINGS_MENU: {
      ARROW_BACK_BUTTON: { css: '.arrow-back-icon' },
      CLOSE_SETTING_MENU: { css: '.close-icon' },
      GENERAL_SETTINGS: { xpath: '//div[contains(text(),"General")]' },
      SET_TIMEOUT: (timeout: string): Locator => ({
        xpath: `//div[contains(text(),'${timeout}')]`,
      }),
      OPEN_TIMEOUT_MENU: { xpath: '//div[contains(text(),"Browser timeout")]' },
      LOG_OUT_BUTTON: { xpath: '//span[contains(text(),"Log out")]' },
    },
    KEEPER_TABS: {
      NFT: { xpath: '//li[contains(text(),"NFTs")]' },
      ASSETS: { xpath: '//li[contains(text(),"Assets")]' },
      HISTORY: { xpath: '//li[contains(text(),"History")]' },
    },
    ACCOUNTS: {
      ADD_NEW_ACCOUNT_BUTTON: '$addAccountButton',
      CHOOSE_ACCOUNT_BUTTON: '$otherAccountsButton',
      ACCOUNT_NAME: '$accountName',
      ACCOUNT_TYPE: (prefix: string): Locator => ({
        xpath: `//div[contains(text(),'${prefix}')]`,
      }),
      ACCOUNT_AT_POSITION: (position = 1): Locator => ({
        xpath: `//div[@data-testid="accountCard"][${position}]`,
      }),
    },
    TRANSACTION_MODAL: {
      RECIPIENT_AMOUNT_FIELD: '$recipientInput',
      AMOUNT_INPUT: '$amountInput',
      SUBMIT_TRANSFER_AMOUNT: '$submitButton',
      AMOUNT_VALUE: (value: number): Locator => ({
        xpath: `//span[contains(text(),'${value}')]`,
      }),
      REJECT_TRANSACTION: '$rejectButton',
      CLOSE_TRANSACTION_WINDOW: '$closeTransaction',
    },
  };
}
