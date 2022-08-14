import { TABS_MOCK_MESSAGE } from '../../testData/res/constants';
import { ClockUnit } from '../../utils/clockUnit';
import { BasePage } from '../pages/BasePage';
import { ExtensionInitHandler } from '../../utils/ExtensionInitHandler';
import { AccountPage } from '../pages/AccountPage';
import { ResourcesProvider } from '../../testData/res/ResourcesProvider';
import { copyDir } from '../../utils/copyDirHandler';
import { DEFAULT_PASSWORD } from '../../testData/res/constants';
import { AccountSeeder } from '../../utils/AccountSeeder';
import { AssetPage } from '../pages/AssetPage';
import { ModalPage } from '../pages/ModalPage';
import { Locator } from '../../interfaces/Locator.interface';

const basePage = new BasePage();
const clockUnit = new ClockUnit();
const extensionInitHandler = new ExtensionInitHandler();
const accountPage = new AccountPage();
const resourcesProvider = new ResourcesProvider();
const accountSeeder = new AccountSeeder();
const assetPage = new AssetPage();
const modalPage = new ModalPage();

const { I } = inject();

const emptyHistoryMessage = TABS_MOCK_MESSAGE.emptyHistory;
const emptyNftMessage = TABS_MOCK_MESSAGE.emptyNft;
const nftExistMessage = TABS_MOCK_MESSAGE.nftExist;

Feature('Initial Test');

Background(async () => {
  await extensionInitHandler.extensionInit();
  await extensionInitHandler.initAccountScreen();
  await accountSeeder.populateEmbeddedSeed();
  await accountSeeder.populateEmbeddedEmail();
});

const updateButtonEdge: Locator =
  basePage.BROWSER_SELECTORS.EDGE.UPDATE_EXTENSION_BUTTON;
const updateButtonChromium: Locator =
  basePage.BROWSER_SELECTORS.CHROMIUM.UPDATE_EXTENSION_BUTTON;

const initData = new DataTable([
  'executionTag',
  'extensionTag',
  'updateDir',
  'locator',
  // 'initDir',
]);
initData.add(['@opera', 'operaId', 'opera_dir_update', updateButtonChromium]);
initData.add([
  '@debug',
  'chromeId',
  'chrome_dir_update',
  updateButtonChromium,
]);
initData.add(['@edge', 'edgeId', 'edge_dir_update', updateButtonEdge]);

Data(initData).Scenario('Update unlogged keeper', async ({ current }) => {
  const {
    extensionTag: EXT_ID,
    updateDir: UPDATE_DIR,
    locator: UPDATE_BUTTON_SELECTOR,
    // initDir: INIT_DIR,
  } = current;
  const extId = await basePage.getItemFromLocalStorage(EXT_ID);
  await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_HTML);
  await I.waitForElement(
    accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Mainnet'),
    clockUnit.SECONDS * 30
  );
  await I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Mainnet'));
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_EMAIL'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_EMAIL')
  );
  await I.waitForElement(
    assetPage.SELECTORS.WAVES_ASSET,
    clockUnit.SECONDS * 30
  );
  await I.seeElement(assetPage.SELECTORS.WAVES_ASSET);
  await I.waitForElement(
    modalPage.SELECTORS.KEEPER_TABS.NFT,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.KEEPER_TABS.NFT);
  await I.see(emptyNftMessage);
  await I.click(modalPage.SELECTORS.KEEPER_TABS.HISTORY);
  await I.waitForText(emptyHistoryMessage, clockUnit.SECONDS * 30);
  await I.see(emptyHistoryMessage);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.FIRST_ACCOUNT,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.FIRST_ACCOUNT);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED'));
  await I.click(modalPage.SELECTORS.KEEPER_TABS.ASSETS);
  await I.waitForElement(
    assetPage.SELECTORS.WAVES_ASSET,
    clockUnit.SECONDS * 30
  );
  await I.seeElement(assetPage.SELECTORS.WAVES_ASSET);
  await I.seeElement(assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.BTC_ASSET);
  await I.seeElement(assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.CRV_ASSET);
  await I.seeElement(assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.EGG_ASSET);
  await I.seeElement(assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.ETH_ASSET);
  await I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Testnet'));
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_EMAIL'),
    clockUnit.SECONDS * 30
  );
  // I.wait(clockUnit.MINUTES * 2);
  await I.waitForVisible(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_EMAIL'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_EMAIL')
  );
  await I.click(modalPage.SELECTORS.KEEPER_TABS.ASSETS);
  await I.seeElement(assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.ASSET_EMAIL_1);
  await I.seeElement(assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.ASSET_EMAIL_2);
  await I.waitForElement(
    modalPage.SELECTORS.KEEPER_TABS.NFT,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.KEEPER_TABS.NFT);
  await I.waitForElement(
    assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.NFT_ASSETS.NFT_GROUP,
    clockUnit.SECONDS * 30
  );
  await I.seeElement(
    assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.NFT_ASSETS.NFT_GROUP
  );
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.FIRST_ACCOUNT,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.FIRST_ACCOUNT);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED'));
  await I.click(modalPage.SELECTORS.KEEPER_TABS.ASSETS);
  await I.seeElement(assetPage.SELECTORS.WAVES_ASSET);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_1);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_2);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_3);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_4);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_5);
  await I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Stagenet'));
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('STAGENET_SEED'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('STAGENET_SEED')
  );
  await I.click(modalPage.SELECTORS.KEEPER_TABS.ASSETS);
  await I.seeElement(assetPage.SELECTORS.WAVES_ASSET);
  await I.seeElement(assetPage.SELECTORS.STAGENET_SEED_ACCOUNT.ASSET_STG_1);
  await I.seeElement(assetPage.SELECTORS.STAGENET_SEED_ACCOUNT.ASSET_STG_2);
  await I.seeElement(assetPage.SELECTORS.STAGENET_SEED_ACCOUNT.ASSET_STG_3);
  await I.click(modalPage.SELECTORS.KEEPER_TABS.NFT);
  await I.see(nftExistMessage);
  await I.click(modalPage.SELECTORS.SETTINGS_BUTTON);
  await I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.LOG_OUT_BUTTON,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.SETTINGS_MENU.LOG_OUT_BUTTON);
  // await I.openNewTab();
  // await I.switchToNextTab(2);
  await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM_EXTENSIONS_PAGE);
  const updateChrome = await resourcesProvider.prepareUpdateDir(UPDATE_DIR);
  await copyDir(updateChrome);
  await I.wait(clockUnit.SECONDS * 5);
  await I.waitForElement(UPDATE_BUTTON_SELECTOR, clockUnit.SECONDS * 30);
  // await I.seeElement(
  //   basePage.BROWSER_SELECTORS.CHROMIUM.UPDATE_EXTENSION_BUTTON
  // );
  await I.forceClick(UPDATE_BUTTON_SELECTOR);
  await I.wait(clockUnit.SECONDS * 5);
  await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_HTML);
  await I.waitForElement(
    modalPage.SELECTORS.KEEPER_PASSWORD_INPUT,
    clockUnit.SECONDS * 30
  );
  await I.fillField(
    modalPage.SELECTORS.KEEPER_PASSWORD_INPUT,
    DEFAULT_PASSWORD
  );
  await I.click(modalPage.SELECTORS.SUBMIT_KEEPER_PASSWORD);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('STAGENET_SEED'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('STAGENET_SEED')
  );
  await I.waitForText(nftExistMessage);
  await I.see(nftExistMessage);
  await I.click(modalPage.SELECTORS.KEEPER_TABS.ASSETS);
  await I.seeElement(assetPage.SELECTORS.WAVES_ASSET);
  await I.seeElement(assetPage.SELECTORS.STAGENET_SEED_ACCOUNT.ASSET_STG_1);
  await I.seeElement(assetPage.SELECTORS.STAGENET_SEED_ACCOUNT.ASSET_STG_2);
  await I.seeElement(assetPage.SELECTORS.STAGENET_SEED_ACCOUNT.ASSET_STG_3);
  await I.waitForElement(
    accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Mainnet'),
    clockUnit.SECONDS * 30
  );
  await I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Mainnet'));
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED'));
  await I.click(modalPage.SELECTORS.KEEPER_TABS.ASSETS);
  await I.waitForElement(
    assetPage.SELECTORS.WAVES_ASSET,
    clockUnit.SECONDS * 30
  );
  await I.seeElement(assetPage.SELECTORS.WAVES_ASSET);
  await I.seeElement(assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.BTC_ASSET);
  await I.seeElement(assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.CRV_ASSET);
  await I.seeElement(assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.EGG_ASSET);
  await I.seeElement(assetPage.SELECTORS.MAINNET_SEED_ACCOUNT.ETH_ASSET);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.FIRST_ACCOUNT,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.FIRST_ACCOUNT);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_EMAIL'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_EMAIL')
  );
  await I.waitForElement(
    assetPage.SELECTORS.WAVES_ASSET,
    clockUnit.SECONDS * 30
  );
  await I.seeElement(assetPage.SELECTORS.WAVES_ASSET);
  await I.waitForElement(
    modalPage.SELECTORS.KEEPER_TABS.NFT,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.KEEPER_TABS.NFT);
  await I.see(emptyNftMessage);
  await I.click(modalPage.SELECTORS.KEEPER_TABS.HISTORY);
  await I.waitForText(emptyHistoryMessage, clockUnit.SECONDS * 30);
  await I.see(emptyHistoryMessage);
  await I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Testnet'));
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED'));
  await I.click(modalPage.SELECTORS.KEEPER_TABS.ASSETS);
  await I.seeElement(assetPage.SELECTORS.WAVES_ASSET);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_1);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_2);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_3);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_4);
  await I.seeElement(assetPage.SELECTORS.TESTNET_SEED_ACCOUNT.ASSET_TST_5);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.FIRST_ACCOUNT,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.FIRST_ACCOUNT);
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_EMAIL'),
    clockUnit.SECONDS * 30
  );
  // I.wait(clockUnit.MINUTES * 2);
  await I.waitForVisible(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_EMAIL'),
    clockUnit.SECONDS * 30
  );
  await I.seeElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_EMAIL')
  );
  await I.click(modalPage.SELECTORS.KEEPER_TABS.ASSETS);
  await I.seeElement(assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.ASSET_EMAIL_1);
  await I.seeElement(assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.ASSET_EMAIL_2);
  await I.waitForElement(
    modalPage.SELECTORS.KEEPER_TABS.NFT,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.KEEPER_TABS.NFT);
  await I.waitForElement(
    assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.NFT_ASSETS.NFT_GROUP,
    clockUnit.SECONDS * 30
  );
  await I.seeElement(
    assetPage.SELECTORS.TESTNET_EMAIL_ACCOUNT.NFT_ASSETS.NFT_GROUP
  );
});

Scenario('debugScenario @ignore', async () => {
  const updateChrome = await resourcesProvider.prepareUpdateDir(
    'chrome_dir_update'
  );
  await copyDir(updateChrome);
  // I.wait(clockUnit.MINUTES * 2);
});
