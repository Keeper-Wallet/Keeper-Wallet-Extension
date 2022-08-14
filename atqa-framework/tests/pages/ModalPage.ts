import { BasePage } from './BasePage';
import { Locator } from '../../interfaces/Locator.interface';

export class ModalPage extends BasePage {
  SELECTORS = {
    KEEPER_PASSWORD_INPUT: '#loginPassword',
    SUBMIT_KEEPER_PASSWORD: '#loginEnter',
    SETTINGS_BUTTON: {
      css: '.height > div:nth-of-type(1) > div > div:nth-of-type(1)',
    },
    SETTINGS_MENU: {
      LOG_OUT_BUTTON: { xpath: '//span[contains(text(),"Log out")]' },
    },
    KEEPER_TABS: {
      NFT: { xpath: '//li[contains(text(),"NFTs")]' },
      ASSETS: { xpath: '//li[contains(text(),"Assets")]' },
      HISTORY: { xpath: '//li[contains(text(),"History")]' },
    },
    ACCOUNTS: {
      CHOOSE_ACCOUNT_BUTTON: '$otherAccountsButton',
      ACCOUNT_NAME: '$accountName',
      ACCOUNT_TYPE: (prefix: string): Locator => ({
        xpath: `//div[contains(text(),'${prefix}')]`,
      }),
      FIRST_ACCOUNT: {
        css: '[data-testid="accountCard"] > div:nth-of-type(2)',
      },
    },
    TRANSACTION_MODAL: {
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
