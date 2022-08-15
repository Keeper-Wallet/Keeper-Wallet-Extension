import { ClockUnit } from './clockUnit';
import { AccountPage } from '../tests/pages/AccountPage';
import { ResourcesProvider } from '../testData/res/ResourcesProvider';
import { DataGenerator } from './DataGenerator';
import { UserProvider } from '../testData/UserProvider';

const { I } = inject();

const clockUnit = new ClockUnit();
const accountPage = new AccountPage();
const resourcesProvider = new ResourcesProvider();
const dataGenerator = new DataGenerator();
const userProvider = new UserProvider();

export class AccountSeeder {
  populateEmbeddedSeed = async (): Promise<void> => {
    const stagenetSeed = resourcesProvider.getStageNetSeed();
    const testnetSeed = resourcesProvider.getTestNetSeed();
    const mainnetSeed = resourcesProvider.getMainNetSeed();
    const accountSeedNameStagenet = dataGenerator.accountName('STAGENET_SEED');
    const accountSeedNameTestnet = dataGenerator.accountName('TESTNET_SEED');
    const accountSeedNameMainnet = dataGenerator.accountName('MAINNET_SEED');

    // TODO: rewrite this madness with builders and implement services to prepare data objects
    const seeds = [stagenetSeed, testnetSeed, mainnetSeed];
    const network = ['Stagenet', 'Testnet', 'Mainnet'];
    const accountName = [
      accountSeedNameStagenet,
      accountSeedNameTestnet,
      accountSeedNameMainnet,
    ];

    for (let i = 0; i < seeds.length; i++) {
      I.waitForElement(
        accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON);
      I.waitForElement(
        accountPage.SELECTORS.NETWORK.NETWORK_TYPE(network[i]),
        clockUnit.SECONDS * 30
      );
      I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE(network[i]));
      I.waitForElement(
        accountPage.SELECTORS.SEED_ACCOUNTS.IMPORT_SEED,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.SEED_ACCOUNTS.IMPORT_SEED);
      I.waitForElement(
        accountPage.SELECTORS.SEED_ACCOUNTS.SEED_PHRASE_INPUT,
        clockUnit.SECONDS * 30
      );
      I.fillField(
        accountPage.SELECTORS.SEED_ACCOUNTS.SEED_PHRASE_INPUT,
        seeds[i].phrase as string
      );
      I.seeTextEquals(seeds[i].address, accountPage.SELECTORS.ACCOUNT_ADDRESS);
      I.waitForElement(
        accountPage.SELECTORS.CONTINUE_BUTTON,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
      I.waitForElement(
        accountPage.SELECTORS.ACCOUNT_NAME_INPUT,
        clockUnit.SECONDS * 30
      );
      I.fillField(accountPage.SELECTORS.ACCOUNT_NAME_INPUT, accountName[i]);
      I.waitForElement(
        accountPage.SELECTORS.CONTINUE_BUTTON,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
      I.waitForElement(
        accountPage.SELECTORS.ADD_ANOTHER_ACCOUNT,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.ADD_ANOTHER_ACCOUNT);
    }
  };

  populateCustomSeed = async (seedType: string): Promise<void> => {
    const customSeed = resourcesProvider.getCustomSeed(seedType);
    const accountSeedNameTestnet = dataGenerator.accountName('CUSTOM_SEED');

    I.waitForElement(
      accountPage.SELECTORS.SEED_ACCOUNTS.IMPORT_SEED,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.SEED_ACCOUNTS.IMPORT_SEED);
    I.waitForElement(
      accountPage.SELECTORS.SEED_ACCOUNTS.SEED_PHRASE_INPUT,
      clockUnit.SECONDS * 30
    );
    I.fillField(
      accountPage.SELECTORS.SEED_ACCOUNTS.SEED_PHRASE_INPUT,
      customSeed.phrase as string
    );
    I.seeTextEquals(customSeed.address, accountPage.SELECTORS.ACCOUNT_ADDRESS);
    I.waitForElement(
      accountPage.SELECTORS.CONTINUE_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
    I.waitForElement(
      accountPage.SELECTORS.ACCOUNT_NAME_INPUT,
      clockUnit.SECONDS * 30
    );
    I.fillField(
      accountPage.SELECTORS.ACCOUNT_NAME_INPUT,
      accountSeedNameTestnet
    );
    I.waitForElement(
      accountPage.SELECTORS.CONTINUE_BUTTON,
      clockUnit.SECONDS * 30
    );
    I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
  };

  populateEmbeddedEmail = async (): Promise<void> => {
    const userTestnet = userProvider.getTestNetUser();
    const userMainnet = userProvider.getMainNetUser();

    const accountEmailNameTestnet = dataGenerator.accountName('TESTNET_EMAIL');
    const accountEmailNameMainnet = dataGenerator.accountName('MAINNET_EMAIL');

    // TODO: Forgive me God for this code but I didn't have time to think
    const emailUsers = [userMainnet, userTestnet];
    const network = ['Mainnet', 'Testnet'];
    const accountName = [accountEmailNameMainnet, accountEmailNameTestnet];

    for (let i = 0; i < emailUsers.length; i++) {
      I.waitForElement(
        accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON);
      I.waitForElement(
        accountPage.SELECTORS.NETWORK.NETWORK_TYPE(network[i]),
        clockUnit.SECONDS * 30
      );
      I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE(network[i]));
      I.waitForElement(
        accountPage.SELECTORS.EMAIL_ACCOUNTS.IMPORT_EMAIL,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.EMAIL_ACCOUNTS.IMPORT_EMAIL);
      I.waitForElement(
        accountPage.SELECTORS.EMAIL_ACCOUNTS.INPUT_ACCOUNT_EMAIL,
        clockUnit.SECONDS * 30
      );
      I.fillField(
        accountPage.SELECTORS.EMAIL_ACCOUNTS.INPUT_ACCOUNT_EMAIL,
        emailUsers[i].email
      );
      I.waitForElement(
        accountPage.SELECTORS.ACCOUNT_PASSWORD_INPUT,
        clockUnit.SECONDS * 30
      );
      I.fillField(
        accountPage.SELECTORS.ACCOUNT_PASSWORD_INPUT,
        emailUsers[i].password
      );
      I.waitForElement(
        accountPage.SELECTORS.SUBMIT_ACCOUNT_BUTTON,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.SUBMIT_ACCOUNT_BUTTON);
      I.waitForElement(
        accountPage.SELECTORS.ACCOUNT_NAME_INPUT,
        clockUnit.SECONDS * 30
      );
      I.fillField(accountPage.SELECTORS.ACCOUNT_NAME_INPUT, accountName[i]);
      I.waitForElement(
        accountPage.SELECTORS.CONTINUE_BUTTON,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.CONTINUE_BUTTON);
      I.waitForElement(
        accountPage.SELECTORS.ADD_ANOTHER_ACCOUNT,
        clockUnit.SECONDS * 30
      );
      I.click(accountPage.SELECTORS.ADD_ANOTHER_ACCOUNT);
    }
  };
}
