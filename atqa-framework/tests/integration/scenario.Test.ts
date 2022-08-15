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
import { ExtensionInitPage } from '../pages/ExtensionInitPage';

const basePage = new BasePage();
const clockUnit = new ClockUnit();
const extensionInitHandler = new ExtensionInitHandler();
const accountPage = new AccountPage();
const resourcesProvider = new ResourcesProvider();
const accountSeeder = new AccountSeeder();
const assetPage = new AssetPage();
const modalPage = new ModalPage();
const extensionInitPage = new ExtensionInitPage();

const { I } = inject();

const emptyHistoryMessage = TABS_MOCK_MESSAGE.emptyHistory;
const emptyNftMessage = TABS_MOCK_MESSAGE.emptyNft;
const nftExistMessage = TABS_MOCK_MESSAGE.nftExist;
const rejectedMessage = TABS_MOCK_MESSAGE.transactionReject;

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
  'initDir',
]);
initData.add([
  '@opera',
  'operaId',
  'opera_dir_update',
  updateButtonChromium,
  'opera_dir_init',
]);
initData.add([
  '@chrome',
  'chromeId',
  'chrome_dir_update',
  updateButtonChromium,
  'chrome_dir_init',
]);
initData.add([
  '@edge',
  'edgeId',
  'edge_dir_update',
  updateButtonEdge,
  'edge_dir_init',
]);

Data(initData).Scenario('Update unlogged keeper', async ({ current }) => {
  const {
    extensionTag: EXT_ID,
    updateDir: UPDATE_DIR,
    locator: UPDATE_BUTTON_SELECTOR,
    initDir: INIT_DIR,
  } = current;
  const extId = await basePage.getItemFromLocalStorage(EXT_ID);
  await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_HTML);
  await I.waitForElement(
    modalPage.SELECTORS.SETTINGS_BUTTON,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.SETTINGS_BUTTON);
  await I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.GENERAL_SETTINGS,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.SETTINGS_MENU.GENERAL_SETTINGS);
  await I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.OPEN_TIMEOUT_MENU,
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.SETTINGS_MENU.OPEN_TIMEOUT_MENU);
  await I.waitForElement(
    modalPage.SELECTORS.SETTINGS_MENU.SET_TIMEOUT('1 hour'),
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.SETTINGS_MENU.SET_TIMEOUT('1 hour'));
  await I.click(modalPage.SELECTORS.SETTINGS_MENU.ARROW_BACK_BUTTON);
  await I.click(modalPage.SELECTORS.SETTINGS_MENU.CLOSE_SETTING_MENU);
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
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
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
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
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
  await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM_EXTENSIONS_PAGE);
  const updateDir = await resourcesProvider.prepareUpdateDir(UPDATE_DIR);
  await copyDir(updateDir);
  await I.waitForElement(UPDATE_BUTTON_SELECTOR, clockUnit.SECONDS * 30);
  await I.forceClick(UPDATE_BUTTON_SELECTOR);
  await extensionInitHandler.restartServiceWorker();
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
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
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
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
    clockUnit.SECONDS * 30
  );
  await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
  await I.waitForElement(
    modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_EMAIL'),
    clockUnit.SECONDS * 30
  );
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
  const initDir = await resourcesProvider.prepareInitDir(INIT_DIR);
  await copyDir(initDir);
});

Data(initData).Scenario(
  'Update Keeper with active transaction',
  async ({ current }) => {
    const {
      extensionTag: EXT_ID,
      updateDir: UPDATE_DIR,
      locator: UPDATE_BUTTON_SELECTOR,
      initDir: INIT_DIR,
    } = current;
    const extId = await basePage.getItemFromLocalStorage(EXT_ID);
    await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_HTML);
    await I.waitForElement(
      modalPage.SELECTORS.SETTINGS_BUTTON,
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.SETTINGS_BUTTON);
    await I.waitForElement(
      modalPage.SELECTORS.SETTINGS_MENU.GENERAL_SETTINGS,
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.GENERAL_SETTINGS);
    await I.waitForElement(
      modalPage.SELECTORS.SETTINGS_MENU.OPEN_TIMEOUT_MENU,
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.OPEN_TIMEOUT_MENU);
    await I.waitForElement(
      modalPage.SELECTORS.SETTINGS_MENU.SET_TIMEOUT('1 hour'),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.SET_TIMEOUT('1 hour'));
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.ARROW_BACK_BUTTON);
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.CLOSE_SETTING_MENU);
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
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED'),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED')
    );
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
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED'),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED')
    );
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
    await I.click(modalPage.SELECTORS.KEEPER_TABS.ASSETS);
    await I.moveCursorTo(assetPage.SELECTORS.WAVES_MORE_BUTTON);
    await I.waitForElement(
      assetPage.SELECTORS.SEND_BUTTON,
      clockUnit.SECONDS * 30
    );
    await I.click(assetPage.SELECTORS.SEND_BUTTON);
    await I.waitForElement(
      modalPage.SELECTORS.TRANSACTION_MODAL.RECIPIENT_AMOUNT_FIELD,
      clockUnit.SECONDS * 30
    );
    const seedUser = await resourcesProvider.getStageNetSeed();
    await I.fillField(
      modalPage.SELECTORS.TRANSACTION_MODAL.RECIPIENT_AMOUNT_FIELD,
      seedUser.address
    );
    await I.waitForElement(
      modalPage.SELECTORS.TRANSACTION_MODAL.AMOUNT_INPUT,
      clockUnit.SECONDS * 30
    );
    await I.fillField(modalPage.SELECTORS.TRANSACTION_MODAL.AMOUNT_INPUT, 10);
    await I.waitForElement(
      modalPage.SELECTORS.TRANSACTION_MODAL.SUBMIT_TRANSFER_AMOUNT,
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.TRANSACTION_MODAL.SUBMIT_TRANSFER_AMOUNT);
    await I.waitForElement(
      modalPage.SELECTORS.TRANSACTION_MODAL.AMOUNT_VALUE(10),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(modalPage.SELECTORS.TRANSACTION_MODAL.AMOUNT_VALUE(10));
    await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM_EXTENSIONS_PAGE);
    const updateDir = await resourcesProvider.prepareUpdateDir(UPDATE_DIR);
    await copyDir(updateDir);
    await I.waitForElement(UPDATE_BUTTON_SELECTOR, clockUnit.SECONDS * 30);
    await I.forceClick(UPDATE_BUTTON_SELECTOR);
    await extensionInitHandler.restartServiceWorker();
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
      modalPage.SELECTORS.TRANSACTION_MODAL.AMOUNT_VALUE(10),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(modalPage.SELECTORS.TRANSACTION_MODAL.AMOUNT_VALUE(10));
    await I.click(modalPage.SELECTORS.TRANSACTION_MODAL.REJECT_TRANSACTION);
    await I.waitForText(rejectedMessage, clockUnit.SECONDS * 30);
    await I.see(rejectedMessage);
    await I.click(
      modalPage.SELECTORS.TRANSACTION_MODAL.CLOSE_TRANSACTION_WINDOW
    );
    await I.waitForElement(
      assetPage.SELECTORS.WAVES_AMOUNT(16),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(assetPage.SELECTORS.WAVES_AMOUNT(16));
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('STAGENET_SEED'),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('STAGENET_SEED')
    );
    await I.click(modalPage.SELECTORS.KEEPER_TABS.NFT);
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
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED')
    );
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
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
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
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED')
    );
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
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_EMAIL'),
      clockUnit.SECONDS * 30
    );
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
    const initDir = await resourcesProvider.prepareInitDir(INIT_DIR);
    await copyDir(initDir);
  }
);

Data(initData).Scenario(
  'Update keeper during the account seeding @ignore',
  async ({ current }) => {
    const {
      extensionTag: EXT_ID,
      updateDir: UPDATE_DIR,
      locator: UPDATE_BUTTON_SELECTOR,
      initDir: INIT_DIR,
    } = current;
    const extId = await basePage.getItemFromLocalStorage(EXT_ID);
    await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).POPUP_HTML);
    await I.waitForElement(
      modalPage.SELECTORS.SETTINGS_BUTTON,
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.SETTINGS_BUTTON);
    await I.waitForElement(
      modalPage.SELECTORS.SETTINGS_MENU.GENERAL_SETTINGS,
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.GENERAL_SETTINGS);
    await I.waitForElement(
      modalPage.SELECTORS.SETTINGS_MENU.OPEN_TIMEOUT_MENU,
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.OPEN_TIMEOUT_MENU);
    await I.waitForElement(
      modalPage.SELECTORS.SETTINGS_MENU.SET_TIMEOUT('1 hour'),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.SET_TIMEOUT('1 hour'));
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.ARROW_BACK_BUTTON);
    await I.click(modalPage.SELECTORS.SETTINGS_MENU.CLOSE_SETTING_MENU);
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
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED'),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED')
    );
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
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED'),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED')
    );
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
    await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM(extId).ACCOUNTS_HTML);
    await I.waitForElement(
      accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON,
      clockUnit.SECONDS * 30
    );
    await I.click(accountPage.SELECTORS.NETWORK.CHOOSE_NETWORK_BUTTON);
    await I.waitForElement(
      accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Testnet'),
      clockUnit.SECONDS * 30
    );
    await I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Testnet'));
    await accountSeeder.populateCustomSeed('TESTNET_SEED_1');
    await I.amOnPage(basePage.BROWSER_URLS.CHROMIUM_EXTENSIONS_PAGE);
    const updateDir = await resourcesProvider.prepareUpdateDir(UPDATE_DIR);
    await copyDir(updateDir);
    await I.waitForElement(UPDATE_BUTTON_SELECTOR, clockUnit.SECONDS * 30);
    await I.forceClick(UPDATE_BUTTON_SELECTOR);
    await extensionInitHandler.restartServiceWorker();
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
      modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON,
      clockUnit.SECONDS * 30
    );
    await I.forceClick(modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON);
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(1),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(1));
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('CUSTOM_SEED'),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('CUSTOM_SEED')
    );
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON,
      clockUnit.SECONDS * 30
    );
    await I.forceClick(modalPage.SELECTORS.ACCOUNTS.CHOOSE_ACCOUNT_BUTTON);
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED'),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_SEED')
    );
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
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(1),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(1));
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('TESTNET_EMAIL'),
      clockUnit.SECONDS * 30
    );
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
    await I.waitForElement(
      accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Mainnet'),
      clockUnit.SECONDS * 30
    );
    await I.forceClick(accountPage.SELECTORS.NETWORK.NETWORK_TYPE('Mainnet'));
    await I.waitForElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED'),
      clockUnit.SECONDS * 30
    );
    await I.seeElement(
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_TYPE('MAINNET_SEED')
    );
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
      modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION(),
      clockUnit.SECONDS * 30
    );
    await I.click(modalPage.SELECTORS.ACCOUNTS.ACCOUNT_AT_POSITION());
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

    const initDir = await resourcesProvider.prepareInitDir(INIT_DIR);
    await copyDir(initDir);
  }
);
