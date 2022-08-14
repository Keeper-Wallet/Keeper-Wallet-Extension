import { BasePage } from './BasePage';
import { Locator } from '../../interfaces/Locator.interface';

export class AccountPage extends BasePage {
  public SELECTORS = {
    NETWORK: {
      CHOOSE_NETWORK_BUTTON: {
        css: '.height > div:nth-of-type(3) > div:nth-of-type(1)',
      },
      NETWORK_TYPE: (networkType: string): Locator => ({
        xpath: `//div[contains(text(),'${networkType}')]`,
      }),
    },
    KEEPER_VERSION: '$currentVersion',
    ACCOUNT_ADDRESS: '$address',
    ACCOUNT_NAME_INPUT: '$newAccountNameInput',
    ADD_ANOTHER_ACCOUNT: '$addAnotherAccountBtn',
    GET_STARTED_BUTTON: '$getStartedBtn',
    ACCOUNT_PASSWORD_INPUT: '$passwordInput',
    SUBMIT_ACCOUNT_BUTTON: '$submitButton',
    CONTINUE_BUTTON: '$continueBtn',
    FINISH_ACCOUNT_CREATION: '$finishBtn',
    CREATE_PASSWORD_INPUT: {
      CREATE_PASSWORD: { id: 'first' },
      CONFIRM_PASSWORD: { id: 'second' },
      CONTINUE_BUTTON: locate('button').withText('Continue'),
      ACCEPT_TERMS_CHECKBOX: { id: 'termsAccepted' },
      ACCEPT_CONDITIONS: { id: 'conditionsAccepted' },
    },
    KEYSTORE_ACCOUNTS: {
      ADD_ACCOUNT_BUTTON: '$addAccountBtn',
      ADD_KEYSTORE_BUTTON: '$importKeystore',
      KEYSTORE_FILE_INPUT: '$fileInput',
    },
    SEED_ACCOUNTS: {
      IMPORT_SEED: '$importSeed',
      SEED_PHRASE_INPUT: '$seedInput',
    },
    EMAIL_ACCOUNTS: {
      IMPORT_EMAIL: '$importEmail',
      INPUT_ACCOUNT_EMAIL: '$emailInput',
    },
  };
}
