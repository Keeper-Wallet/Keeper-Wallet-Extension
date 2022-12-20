import { binary, serializePrimitives } from '@waves/marshall';
import {
  base58Encode,
  blake2b,
  concat,
  verifySignature,
} from '@waves/ts-lib-crypto';
import { makeTxBytes, serializeCustomData } from '@waves/waves-transactions';
import { orderToProtoBytes } from '@waves/waves-transactions/dist/proto-serialize';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import { expect } from 'expect-webdriverio';
import create from 'parse-json-bignumber';

import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { MessagesScreen } from './helpers/MessagesScreen';
import { AssetScriptTransactionScreen } from './helpers/transactions/AssetScriptTransactionScreen';
import { AuthTransactionScreen } from './helpers/transactions/AuthTransactionScreen';
import { BurnTransactionScreen } from './helpers/transactions/BurnTransactionScreen';
import { CancelOrderTransactionScreen } from './helpers/transactions/CancelOrderTransactionScreen';
import { CommonTransaction } from './helpers/transactions/CommonTransaction';
import { CreateAliasTransactionScreen } from './helpers/transactions/CreateAliasTransactionScreen';
import { CreateOrderTransaction } from './helpers/transactions/CreateOrderTransaction';
import { DataTransactionScreen } from './helpers/transactions/DataTransactionScreen';
import { FinalTransactionScreen } from './helpers/transactions/FinalTransactionScreen';
import { InvokeScriptTransactionScreen } from './helpers/transactions/InvokeScriptTransactionScreen';
import { IssueTransactionScreen } from './helpers/transactions/IssueTransactionScreen';
import { LeaseCancelTransactionScreen } from './helpers/transactions/LeaseCancelTransactionScreen';
import { LeaseTransactionScreen } from './helpers/transactions/LeaseTransactionScreen';
import { MassTransferTransactionScreen } from './helpers/transactions/MassTransferTransactionScreen';
import { PackageTransactionScreen } from './helpers/transactions/PackageTransactionScreen';
import { ReissueTransactionScreen } from './helpers/transactions/ReissueTransactionScreen';
import { SetScriptTransactionScreen } from './helpers/transactions/SetScriptTransactionScreen';
import { SponsorshipTransactionScreen } from './helpers/transactions/SponsorshipTransactionScreen';
import { TransferTransactionScreen } from './helpers/transactions/TransferTransactionScreen';
import { UpdateAssetInfoTransactionScreen } from './helpers/transactions/UpdateAssetInfoTransactionScreen';
import { AccountsHome, App, Network, Settings, Windows } from './utils/actions';
import { CUSTOMLIST, WHITELIST } from './utils/constants';
import { CUSTOM_DATA_V1, CUSTOM_DATA_V2 } from './utils/customData';
import {
  ALIAS,
  BURN,
  BURN_WITH_QUANTITY,
  CANCEL_LEASE,
  DATA,
  INVOKE_SCRIPT,
  INVOKE_SCRIPT_WITHOUT_CALL,
  ISSUE,
  ISSUE_WITHOUT_SCRIPT,
  LEASE,
  LEASE_WITH_ALIAS,
  LEASE_WITH_MONEY_LIKE,
  MASS_TRANSFER,
  MASS_TRANSFER_WITHOUT_ATTACHMENT,
  PACKAGE,
  REISSUE,
  REISSUE_WITH_MONEY_LIKE,
  SET_ASSET_SCRIPT,
  SET_SCRIPT,
  SET_SCRIPT_WITHOUT_SCRIPT,
  SPONSORSHIP,
  SPONSORSHIP_REMOVAL,
  TRANSFER,
  TRANSFER_WITHOUT_ATTACHMENT,
  UPDATE_ASSET_INFO,
} from './utils/transactions';

const { parse } = create();

describe('Signature', function () {
  let tabOrigin: string;
  let messageWindow: string | null = null;

  const senderPublicKey = 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV';

  before(async function () {
    await App.initVault();
    await Settings.setMaxSessionTimeout();
    await browser.openKeeperPopup();
    await Network.switchToAndCheck('Testnet');
    const tabKeeper = await browser.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
    const [tabAccounts] = await waitForNewWindows(1);

    await browser.switchToWindow(tabKeeper);
    await browser.closeWindow();

    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await AccountsHome.importAccount(
      'rich',
      'waves private node seed with waves tokens'
    );

    tabOrigin = (await browser.createWindow('tab')).handle;

    await browser.switchToWindow(tabAccounts);
    await browser.closeWindow();
    await browser.switchToWindow(tabOrigin);
    await browser.navigateTo(`https://${WHITELIST[3]}`);
  });

  after(async function () {
    const tabKeeper = (await browser.createWindow('tab')).handle;
    await browser.switchToWindow(tabKeeper);
    await App.closeBgTabs(tabKeeper);
    await App.resetVault();
  });

  describe('Stale messages removal', function () {
    it('removes messages and closes window when tab is reloaded', async function () {
      await browser.switchToWindow(tabOrigin);
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.execute(() => {
        KeeperWallet.auth({ data: 'hello' });
      });
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();

      expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
      expect(CommonTransaction.accountName).toHaveText('rich');
      expect(CommonTransaction.originNetwork).toHaveText('Testnet');

      await browser.switchToWindow(tabOrigin);
      await browser.refresh();

      await Windows.waitForWindowToClose(messageWindow);

      await browser.switchToWindow((await browser.createWindow('tab')).handle);
      await browser.openKeeperPopup();

      await browser.closeWindow();
      await browser.switchToWindow(tabOrigin);
    });

    it('removes messages and closes window when the tab is closed', async function () {
      const newTabOrigin = (await browser.createWindow('tab')).handle;
      await browser.switchToWindow(newTabOrigin);
      await browser.navigateTo(`https://${CUSTOMLIST[1]}`);

      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.execute(() => {
        KeeperWallet.auth({ data: 'hello' });
      });
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();

      expect(CommonTransaction.originAddress).toHaveText(CUSTOMLIST[1]);
      expect(CommonTransaction.accountName).toHaveText('rich');
      expect(CommonTransaction.originNetwork).toHaveText('Testnet');

      await browser.switchToWindow(newTabOrigin);
      await browser.closeWindow();
      await browser.switchToWindow(tabOrigin);

      await Windows.waitForWindowToClose(messageWindow);

      await browser.switchToWindow((await browser.createWindow('tab')).handle);
      await browser.openKeeperPopup();

      await browser.closeWindow();
      await browser.switchToWindow(tabOrigin);
    });

    it('does not close message window, if there are other messages left', async function () {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.execute(() => {
        KeeperWallet.auth({ data: 'hello' });
      });
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();

      expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
      expect(CommonTransaction.accountName).toHaveText('rich');
      expect(CommonTransaction.originNetwork).toHaveText('Testnet');

      const newTabOrigin = (await browser.createWindow('tab')).handle;
      await browser.switchToWindow(newTabOrigin);
      await browser.navigateTo(`https://${CUSTOMLIST[1]}`);

      await browser.execute(() => {
        KeeperWallet.auth({ data: 'hello' });
      });

      await browser.switchToWindow(messageWindow);
      await browser.refresh();

      expect(await MessagesScreen.messagesCards).toHaveLength(2);

      await browser.switchToWindow(newTabOrigin);
      await browser.closeWindow();

      await browser.switchToWindow(messageWindow);

      expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
      expect(CommonTransaction.accountName).toHaveText('rich');
      expect(CommonTransaction.originNetwork).toHaveText('Testnet');
      await CommonTransaction.rejectButton.click();
      await FinalTransactionScreen.closeButton.click();
    });
  });

  describe('Permission request from origin', function () {
    async function performPermissionRequest() {
      await browser.switchToWindow(tabOrigin);
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.execute(() => {
        KeeperWallet.publicState().then(
          result => {
            window.result = JSON.stringify(['RESOLVED', result]);
          },
          err => {
            window.result = JSON.stringify(['REJECTED', err]);
          }
        );
      });
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    async function getPermissionRequestResult() {
      return JSON.parse(
        (await browser.execute(() => {
          const { result } = window;
          delete window.result;
          return result;
        })) as string
      );
    }

    after(async function () {
      await browser.navigateTo(`https://${WHITELIST[3]}`);
    });

    it('Rejected', async function () {
      await browser.switchToWindow(tabOrigin);
      await browser.navigateTo(`https://${CUSTOMLIST[0]}`);

      await performPermissionRequest();
      expect(CommonTransaction.originAddress).toHaveText(CUSTOMLIST[0]);
      expect(CommonTransaction.accountName).toHaveText('rich');
      expect(CommonTransaction.originNetwork).toHaveText('Testnet');

      await CommonTransaction.rejectButton.click();
      await FinalTransactionScreen.closeButton.click();

      await browser.switchToWindow(tabOrigin);
      const [status, result] = await getPermissionRequestResult();

      expect(status).toBe('REJECTED');
      expect(result).toStrictEqual({
        message: 'User denied message',
        data: 'rejected',
        code: '10',
      });
    });

    it('Reject forever', async function () {
      await browser.navigateTo(`https://${CUSTOMLIST[1]}`);

      await performPermissionRequest();

      await AuthTransactionScreen.rejectArrowButton.click();
      await AuthTransactionScreen.addToBlacklistButton.click();
      await FinalTransactionScreen.closeButton.click();

      await browser.switchToWindow(tabOrigin);
      const [status, result] = await getPermissionRequestResult();

      expect(status).toBe('REJECTED');

      expect(result).toStrictEqual({
        message: 'User denied message',
        data: 'rejected_forever',
        code: '10',
      });
    });

    it('Approved', async function () {
      await browser.navigateTo(`https://${CUSTOMLIST[0]}`);

      await performPermissionRequest();
      await AuthTransactionScreen.authButton.click();
      await FinalTransactionScreen.closeButton.click();

      await browser.switchToWindow(tabOrigin);
      const [status, result] = await getPermissionRequestResult();

      expect(status).toBe('RESOLVED');
      expect(result.initialized).toBe(true);
      expect(typeof result.version).toBe('string');
      expect(result.messages).toHaveLength(1);
      expect(typeof result.messages[0].id).toBe('string');
      expect(result.messages[0].status).toBe('signed');

      expect(result.account).toMatchObject({
        address: '3MsX9C2MzzxE4ySF5aYcJoaiPfkyxZMg4cW',
        name: 'rich',
        network: 'testnet',
        networkCode: 'T',
        publicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
        type: 'seed',
      });

      expect(result.network).toMatchObject({
        code: 'T',
        server: 'https://nodes-testnet.wavesnodes.com/',
        matcher: 'https://matcher-testnet.waves.exchange/',
      });

      expect(result.txVersion).toMatchObject({
        '3': [3, 2],
        '4': [3, 2],
        '5': [3, 2],
        '6': [3, 2],
        '8': [3, 2],
        '9': [3, 2],
        '10': [3, 2],
        '11': [2, 1],
        '12': [2, 1],
        '13': [2, 1],
        '14': [2, 1],
        '15': [2, 1],
        '16': [2, 1],
        '17': [1],
        '18': [1],
        '1000': [1],
        '1001': [1],
        '1002': [4, 3, 2, 1],
        '1003': [1, 0],
      });
    });
  });

  describe('Authentication request from origin', function () {
    async function performAuthRequest() {
      await browser.switchToWindow(tabOrigin);
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.execute(() => {
        KeeperWallet.auth({ data: 'generated auth data' }).then(
          result => {
            window.result = JSON.stringify(['RESOLVED', result]);
          },
          err => {
            window.result = JSON.stringify(['REJECTED', err]);
          }
        );
      });
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    async function getAuthRequestResult() {
      return JSON.parse(
        (await browser.execute(() => {
          const { result } = window;
          delete window.result;
          return result;
        })) as string
      );
    }

    it('Rejected', async function () {
      await performAuthRequest();
      expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
      expect(CommonTransaction.accountName).toHaveText('rich');
      expect(CommonTransaction.originNetwork).toHaveText('Testnet');
      await CommonTransaction.rejectButton.click();
      await FinalTransactionScreen.closeButton.click();

      await browser.switchToWindow(tabOrigin);
      const [status, result] = await getAuthRequestResult.call(this);

      expect(status).toBe('REJECTED');

      expect(result).toStrictEqual({
        code: '10',
        data: 'rejected',
        message: 'User denied message',
      });
    });

    it('Approved', async function () {
      await performAuthRequest();
      await AuthTransactionScreen.authButton.click();
      await FinalTransactionScreen.closeButton.click();

      await browser.switchToWindow(tabOrigin);
      const [status, result] = await getAuthRequestResult.call(this);

      expect(status).toBe('RESOLVED');

      const expectedApproveResult = {
        host: WHITELIST[3],
        prefix: 'WavesWalletAuthentication',
        address: '3MsX9C2MzzxE4ySF5aYcJoaiPfkyxZMg4cW',
        publicKey: senderPublicKey,
      };

      const bytes = serializeAuthData({
        host: WHITELIST[3],
        data: 'generated auth data',
      });

      expect(result).toMatchObject(expectedApproveResult);

      expect(verifySignature(senderPublicKey, bytes, result.signature)).toBe(
        true
      );
    });
  });

  describe('Matcher request', function () {
    const timestamp = Date.now();

    async function performMatcherRequest() {
      await browser.switchToWindow(tabOrigin);
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.execute(
        // eslint-disable-next-line @typescript-eslint/no-shadow
        (senderPublicKey: string, timestamp: number) => {
          KeeperWallet.signRequest({
            data: {
              senderPublicKey,
              timestamp,
            },
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            type: 1001,
          }).then(
            result => {
              window.result = JSON.stringify(['RESOLVED', result]);
            },
            err => {
              window.result = JSON.stringify(['REJECTED', err]);
            }
          );
        },
        senderPublicKey,
        timestamp
      );
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    async function getMatcherRequestResult() {
      return JSON.parse(
        (await browser.execute(() => {
          const { result } = window;
          delete window.result;
          return result;
        })) as string
      );
    }

    it('Rejected', async function () {
      await performMatcherRequest();
      expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
      expect(CommonTransaction.accountName).toHaveText('rich');
      expect(CommonTransaction.originNetwork).toHaveText('Testnet');
      await CommonTransaction.rejectButton.click();
      await FinalTransactionScreen.closeButton.click();

      await browser.switchToWindow(tabOrigin);
      const [status, result] = await getMatcherRequestResult.call(this);

      expect(status).toBe('REJECTED');

      expect(result).toStrictEqual({
        code: '10',
        data: 'rejected',
        message: 'User denied message',
      });
    });

    it('Approved', async function () {
      await performMatcherRequest();
      await CommonTransaction.approveButton.click();
      await FinalTransactionScreen.closeButton.click();

      await browser.switchToWindow(tabOrigin);
      const [status, result] = await getMatcherRequestResult();

      expect(status).toBe('RESOLVED');

      const bytes = concat(
        serializePrimitives.BASE58_STRING(senderPublicKey),
        serializePrimitives.LONG(timestamp)
      );

      expect(verifySignature(senderPublicKey, bytes, result)).toBe(true);
    });
  });

  describe('Transactions', function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function performSignTransaction(tx: any) {
      await browser.switchToWindow(tabOrigin);
      const { waitForNewWindows } = await Windows.captureNewWindows();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-shadow
      await browser.execute((tx: any) => {
        KeeperWallet.signTransaction(tx).then(
          result => {
            window.result = JSON.stringify(['RESOLVED', result]);
          },
          err => {
            window.result = JSON.stringify(['REJECTED', err]);
          }
        );
      }, tx);
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    async function getSignTransactionResult() {
      return JSON.parse(
        (await browser.execute(() => {
          const { result } = window;
          delete window.result;
          return result;
        })) as string
      );
    }

    function setTxVersion(
      tx: Parameters<typeof KeeperWallet['signTransaction']>[0],
      version: number
    ) {
      return { ...tx, data: { ...tx.data, version } };
    }

    async function checkTxFee(fee: string) {
      expect(CommonTransaction.transactionFee).toHaveText(fee);
    }

    describe('Issue', function () {
      async function checkIssueType(type: string) {
        expect(IssueTransactionScreen.issueType).toHaveText(type);
      }

      async function checkIssueAmount(amount: string) {
        expect(IssueTransactionScreen.issueAmount).toHaveText(amount);
      }

      async function checkIssueDescription(description: string) {
        expect(IssueTransactionScreen.issueDescription).toHaveText(description);
      }

      async function checkIssueDecimals(decimals: number) {
        expect(IssueTransactionScreen.issueDecimals).toHaveText(`${decimals}`);
      }

      async function checkIssueReissuable(reissuableText: string) {
        expect(IssueTransactionScreen.issueReissuable).toHaveText(
          reissuableText
        );
      }

      async function checkIssueScript(script: string) {
        expect(IssueTransactionScreen.contentScript).toHaveText(script);
      }

      it('Rejected', async function () {
        await performSignTransaction(ISSUE);
        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkIssueType('Issue Smart Token');
        await checkIssueAmount('92233720368.54775807 ShortToken');
        await checkIssueDescription(ISSUE.data.description);
        await checkIssueDecimals(ISSUE.data.precision);
        await checkIssueReissuable('Reissuable');
        await checkIssueScript('base64:BQbtKNoM');

        await checkTxFee('1.004 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('REJECTED');

        expect(approveResult).toStrictEqual({
          code: '10',
          data: 'rejected',
          message: 'User denied message',
        });
      });

      it('Approved', async function () {
        await performSignTransaction(ISSUE);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: ISSUE.type,
          version: 3,
          senderPublicKey,
          name: ISSUE.data.name,
          description: ISSUE.data.description,
          quantity: ISSUE.data.quantity,
          script: ISSUE.data.script,
          decimals: ISSUE.data.precision,
          reissuable: ISSUE.data.reissuable,
          fee: 100400000,
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      it('Copying script to the clipboard');

      describe('without script', function () {
        it('Rejected', async function () {
          await performSignTransaction(ISSUE_WITHOUT_SCRIPT);
          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkIssueType('Issue Token');
          await checkIssueAmount('92233720368.54775807 ShortToken');
          await checkIssueDescription(ISSUE.data.description);
          await checkIssueDecimals(ISSUE.data.precision);
          await checkIssueReissuable('Reissuable');

          await checkTxFee('1.004 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('REJECTED');

          expect(approveResult).toStrictEqual({
            code: '10',
            data: 'rejected',
            message: 'User denied message',
          });
        });

        it('Approved', async function () {
          await performSignTransaction(ISSUE_WITHOUT_SCRIPT);
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: ISSUE_WITHOUT_SCRIPT.type,
            version: 3,
            senderPublicKey,
            name: ISSUE_WITHOUT_SCRIPT.data.name,
            description: ISSUE_WITHOUT_SCRIPT.data.description,
            quantity: ISSUE_WITHOUT_SCRIPT.data.quantity,
            decimals: ISSUE_WITHOUT_SCRIPT.data.precision,
            reissuable: ISSUE_WITHOUT_SCRIPT.data.reissuable,
            fee: 100400000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.script).toBe(null);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(ISSUE, 2));
          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkIssueType('Issue Smart Token');
          await checkIssueAmount('92233720368.54775807 ShortToken');
          await checkIssueDescription(ISSUE.data.description);
          await checkIssueDecimals(ISSUE.data.precision);
          await checkIssueReissuable('Reissuable');
          await checkIssueScript('base64:BQbtKNoM');

          await checkTxFee('1.004 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('REJECTED');

          expect(approveResult).toStrictEqual({
            code: '10',
            data: 'rejected',
            message: 'User denied message',
          });
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(ISSUE, 2));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: ISSUE.type,
            version: 2,
            senderPublicKey,
            name: ISSUE.data.name,
            description: ISSUE.data.description,
            quantity: ISSUE.data.quantity,
            script: ISSUE.data.script,
            decimals: ISSUE.data.precision,
            reissuable: ISSUE.data.reissuable,
            fee: 100400000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('Transfer', function () {
      async function checkTransferAmount(amount: string) {
        expect(TransferTransactionScreen.transferAmount).toHaveText(amount);
      }

      async function checkRecipient(recipient: string) {
        expect(TransferTransactionScreen.recipient).toHaveText(recipient);
      }

      async function checkAttachment(attachment: string) {
        expect(TransferTransactionScreen.attachmentContent).toHaveText(
          attachment
        );
      }

      it('Rejected', async function () {
        await performSignTransaction(TRANSFER);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkTransferAmount('-123456790 NonScriptToken');
        await checkRecipient('3N5HNJz5otiU...BVv5HhYLdhiD');
        await checkAttachment('base64:BQbtKNoM');

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(TRANSFER);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: TRANSFER.type,
          version: 3,
          senderPublicKey,
          assetId: TRANSFER.data.amount.assetId,
          recipient: TRANSFER.data.recipient,
          amount: TRANSFER.data.amount.amount,
          attachment: '3ke2ct1rnYr52Y1jQvzNG',
          fee: 500000,
          feeAssetId: null,
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      // TODO this checks should be into unittests
      it('Address');
      it('Alias');
      it('Waves / asset / smart asset');
      it('Attachment');
      it('Transfers to Gateways');

      describe('without attachment', function () {
        it('Rejected', async function () {
          await performSignTransaction(TRANSFER_WITHOUT_ATTACHMENT);

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkTransferAmount('-123456790 NonScriptToken');
          await checkRecipient('alias:T:alice');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(TRANSFER_WITHOUT_ATTACHMENT);
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: TRANSFER_WITHOUT_ATTACHMENT.type,
            version: 3,
            senderPublicKey,
            assetId: TRANSFER_WITHOUT_ATTACHMENT.data.amount.assetId,
            recipient: 'alias:T:alice',
            amount: TRANSFER_WITHOUT_ATTACHMENT.data.amount.amount,
            attachment: '',
            fee: 500000,
            feeAssetId: null,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(TRANSFER, 2));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkTransferAmount('-123456790 NonScriptToken');
          await checkRecipient('3N5HNJz5otiU...BVv5HhYLdhiD');
          await checkAttachment('base64:BQbtKNoM');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(TRANSFER, 2));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: TRANSFER.type,
            version: 2,
            senderPublicKey,
            assetId: TRANSFER.data.amount.assetId,
            recipient: TRANSFER.data.recipient,
            amount: TRANSFER.data.amount.amount,
            attachment: '3ke2ct1rnYr52Y1jQvzNG',
            fee: 500000,
            feeAssetId: null,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('Reissue', function () {
      async function checkReissueAmount(amount: string) {
        expect(ReissueTransactionScreen.reissueAmount).toHaveText(amount);
      }

      async function checkReissueReissuable(reissuableText: string) {
        expect(ReissueTransactionScreen.reissuableType).toHaveText(
          reissuableText
        );
      }

      it('Rejected', async function () {
        await performSignTransaction(REISSUE);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkReissueAmount('+123456790 NonScriptToken');
        await checkReissueReissuable('Reissuable');

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(REISSUE);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: REISSUE.type,
          version: 3,
          senderPublicKey,
          assetId: REISSUE.data.assetId,
          quantity: REISSUE.data.quantity,
          reissuable: REISSUE.data.reissuable,
          chainId: 84,
          fee: 500000,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      describe('with money-like', function () {
        it('Rejected', async function () {
          await performSignTransaction(REISSUE_WITH_MONEY_LIKE);

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkReissueAmount('+123456790 NonScriptToken');
          await checkReissueReissuable('Reissuable');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(REISSUE_WITH_MONEY_LIKE);
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: REISSUE_WITH_MONEY_LIKE.type,
            version: 3,
            senderPublicKey,
            assetId: REISSUE_WITH_MONEY_LIKE.data.amount.assetId,
            quantity: REISSUE_WITH_MONEY_LIKE.data.amount.amount,
            reissuable: REISSUE_WITH_MONEY_LIKE.data.reissuable,
            chainId: 84,
            fee: 500000,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(REISSUE, 2));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkReissueAmount('+123456790 NonScriptToken');
          await checkReissueReissuable('Reissuable');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(REISSUE, 2));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: REISSUE.type,
            version: 2,
            senderPublicKey,
            assetId: REISSUE.data.assetId,
            quantity: REISSUE.data.quantity,
            reissuable: REISSUE.data.reissuable,
            chainId: 84,
            fee: 500000,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('Burn', function () {
      async function checkBurnAmount(amount: string) {
        expect(BurnTransactionScreen.burnAmount).toHaveText(amount);
      }

      it('Rejected', async function () {
        await performSignTransaction(BURN);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkBurnAmount('-123456790 NonScriptToken');

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(BURN);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: BURN.type,
          version: 3,
          senderPublicKey,
          assetId: BURN.data.assetId,
          amount: BURN.data.amount,
          chainId: 84,
          fee: 500000,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      describe('with quantity instead of amount', function () {
        it('Rejected', async function () {
          await performSignTransaction(BURN_WITH_QUANTITY);

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkBurnAmount('-123456790 NonScriptToken');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(BURN_WITH_QUANTITY);
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: BURN_WITH_QUANTITY.type,
            version: 3,
            senderPublicKey,
            assetId: BURN_WITH_QUANTITY.data.assetId,
            amount: BURN_WITH_QUANTITY.data.quantity,
            chainId: 84,
            fee: 500000,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(BURN, 2));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkBurnAmount('-123456790 NonScriptToken');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(BURN, 2));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: BURN.type,
            version: 2,
            senderPublicKey,
            assetId: BURN.data.assetId,
            amount: BURN.data.amount,
            chainId: 84,
            fee: 500000,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('Lease', function () {
      async function checkLeaseAmount(amount: string) {
        expect(LeaseTransactionScreen.leaseAmount).toHaveText(amount);
      }

      async function checkLeaseRecipient(recipient: string) {
        expect(LeaseTransactionScreen.leaseRecipient).toHaveText(recipient);
      }

      it('Rejected', async function () {
        await performSignTransaction(LEASE);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkLeaseAmount('1.23456790 WAVES');
        await checkLeaseRecipient('3N5HNJz5otiU...BVv5HhYLdhiD');

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(LEASE);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: LEASE.type,
          version: 3,
          senderPublicKey,
          amount: LEASE.data.amount,
          recipient: LEASE.data.recipient,
          fee: 500000,
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      describe('with alias', function () {
        it('Rejected', async function () {
          await performSignTransaction(LEASE_WITH_ALIAS);

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkLeaseAmount('1.23456790 WAVES');
          await checkLeaseRecipient('alias:T:bobby');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(LEASE_WITH_ALIAS);
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: LEASE_WITH_ALIAS.type,
            version: 3,
            senderPublicKey,
            amount: LEASE_WITH_ALIAS.data.amount,
            recipient: 'alias:T:bobby',
            fee: 500000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with money-like', function () {
        it('Rejected', async function () {
          await performSignTransaction(LEASE_WITH_MONEY_LIKE);

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkLeaseAmount('1.23456790 WAVES');
          await checkLeaseRecipient('3N5HNJz5otiU...BVv5HhYLdhiD');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(LEASE_WITH_MONEY_LIKE);
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: LEASE_WITH_MONEY_LIKE.type,
            version: 3,
            senderPublicKey,
            amount: LEASE_WITH_MONEY_LIKE.data.amount.amount,
            recipient: LEASE_WITH_MONEY_LIKE.data.recipient,
            fee: 500000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(LEASE, 2));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkLeaseAmount('1.23456790 WAVES');
          await checkLeaseRecipient('3N5HNJz5otiU...BVv5HhYLdhiD');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(LEASE, 2));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: LEASE.type,
            version: 2,
            senderPublicKey,
            amount: LEASE.data.amount,
            recipient: LEASE.data.recipient,
            fee: 500000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('Cancel lease', function () {
      async function checkCancelLeaseAmount(amount: string) {
        expect(LeaseCancelTransactionScreen.cancelLeaseAmount).toHaveText(
          amount
        );
      }

      async function checkCancelLeaseRecipient(recipient: string) {
        expect(LeaseCancelTransactionScreen.cancelLeaseRecipient).toHaveText(
          recipient
        );
      }

      it('Rejected', async function () {
        await performSignTransaction(CANCEL_LEASE);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkCancelLeaseAmount('0.00000001 WAVES');
        await checkCancelLeaseRecipient('alias:T:merry');

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(CANCEL_LEASE);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: CANCEL_LEASE.type,
          version: 3,
          senderPublicKey,
          leaseId: CANCEL_LEASE.data.leaseId,
          fee: 500000,
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(CANCEL_LEASE, 2));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkCancelLeaseAmount('0.00000001 WAVES');
          await checkCancelLeaseRecipient('alias:T:merry');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(CANCEL_LEASE, 2));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: CANCEL_LEASE.type,
            version: 2,
            senderPublicKey,
            leaseId: CANCEL_LEASE.data.leaseId,
            fee: 500000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('Alias', function () {
      async function checkAliasValue(value: string) {
        expect(CreateAliasTransactionScreen.aliasValue).toHaveText(value);
      }

      it('Rejected', async function () {
        await performSignTransaction(ALIAS);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkAliasValue('test_alias');

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(ALIAS);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: ALIAS.type,
          version: 3,
          senderPublicKey,
          alias: ALIAS.data.alias,
          fee: 500000,
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      // TODO this checks should be into unittests
      it('Minimum alias length');
      it('Maximum alias length');

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(ALIAS, 2));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkAliasValue('test_alias');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(ALIAS, 2));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: ALIAS.type,
            version: 2,
            senderPublicKey,
            alias: ALIAS.data.alias,
            fee: 500000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);

          expect(parsedApproveResult.id).toBe(
            base58Encode(blake2b([bytes[0], ...bytes.slice(36, -16)]))
          );

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('MassTransfer', function () {
      async function checkMassTransferAmount(amount: string) {
        expect(MassTransferTransactionScreen.massTransferAmount).toHaveText(
          amount
        );
      }

      async function checkMassTransferItems(
        items: Array<{ recipient: string; amount: string }>
      ) {
        const transferItems =
          await MassTransferTransactionScreen.getTransferItems();

        const actualItems = await Promise.all(
          transferItems.map(async transferItem => {
            const recipient = await transferItem.recipient.getText();
            const amount = await transferItem.amount.getText();
            return { recipient, amount };
          })
        );

        expect(actualItems).toStrictEqual(items);
      }

      async function checkMassTransferAttachment(attachment: string) {
        expect(MassTransferTransactionScreen.massTransferAttachment).toHaveText(
          attachment
        );
      }

      it('Rejected', async function () {
        await performSignTransaction(MASS_TRANSFER);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkMassTransferAmount('-2 NonScriptToken');

        await checkMassTransferItems([
          {
            recipient: '3N5HNJz5otiU...BVv5HhYLdhiD',
            amount: '1',
          },
          {
            recipient: 'alias:T:merry',
            amount: '1',
          },
        ]);

        await checkMassTransferAttachment('base64:BQbtKNoM');

        await checkTxFee('0.006 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(MASS_TRANSFER);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: MASS_TRANSFER.type,
          version: 2,
          senderPublicKey,
          assetId: MASS_TRANSFER.data.totalAmount.assetId,
          transfers: [
            { amount: 1, recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD' },
            { amount: 1, recipient: 'alias:T:merry' },
          ],
          fee: 600000,
          attachment: '3ke2ct1rnYr52Y1jQvzNG',
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      describe('without attachment', function () {
        it('Rejected', async function () {
          await performSignTransaction(MASS_TRANSFER_WITHOUT_ATTACHMENT);

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkMassTransferAmount('-2 NonScriptToken');

          await checkMassTransferItems([
            {
              recipient: '3N5HNJz5otiU...BVv5HhYLdhiD',
              amount: '1',
            },
            {
              recipient: 'alias:T:merry',
              amount: '1',
            },
          ]);

          await checkTxFee('0.006 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(MASS_TRANSFER_WITHOUT_ATTACHMENT);

          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: MASS_TRANSFER_WITHOUT_ATTACHMENT.type,
            version: 2,
            senderPublicKey,
            assetId: MASS_TRANSFER_WITHOUT_ATTACHMENT.data.totalAmount.assetId,
            transfers: [
              { amount: 1, recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD' },
              { amount: 1, recipient: 'alias:T:merry' },
            ],
            fee: 600000,
            attachment: '',
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(MASS_TRANSFER, 1));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkMassTransferAmount('-2 NonScriptToken');

          await checkMassTransferItems([
            {
              recipient: '3N5HNJz5otiU...BVv5HhYLdhiD',
              amount: '1',
            },
            {
              recipient: 'alias:T:merry',
              amount: '1',
            },
          ]);

          await checkMassTransferAttachment('base64:BQbtKNoM');

          await checkTxFee('0.006 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(MASS_TRANSFER, 1));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: MASS_TRANSFER.type,
            version: 1,
            senderPublicKey,
            assetId: MASS_TRANSFER.data.totalAmount.assetId,
            transfers: [
              { amount: 1, recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD' },
              { amount: 1, recipient: 'alias:T:merry' },
            ],
            fee: 600000,
            attachment: '3ke2ct1rnYr52Y1jQvzNG',
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('Data', function () {
      async function checkDataEntries(
        entries: Array<{ key: string; type: string; value: string }>
      ) {
        const dataRows = await DataTransactionScreen.getDataRows();

        const actualItems = await Promise.all(
          dataRows.map(async it => {
            const key = await it.key.getText();
            const type = await it.type.getText();
            const value = await it.value.getText();
            return { key, type, value };
          })
        );

        expect(actualItems).toStrictEqual(entries);
      }

      it('Rejected', async function () {
        await performSignTransaction(DATA);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkDataEntries([
          {
            key: 'stringValue',
            type: 'string',
            value: 'Lorem ipsum dolor sit amet',
          },
          {
            key: 'longMaxValue',
            type: 'integer',
            value: '9223372036854775807',
          },
          {
            key: 'flagValue',
            type: 'boolean',
            value: 'true',
          },
          {
            key: 'base64',
            type: 'binary',
            value: 'base64:BQbtKNoM',
          },
        ]);

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(DATA);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: DATA.type,
          version: 2,
          senderPublicKey,
          fee: 500000,
          chainId: 84,
          data: DATA.data.data,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(DATA, 1));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkDataEntries([
            {
              key: 'stringValue',
              type: 'string',
              value: 'Lorem ipsum dolor sit amet',
            },
            {
              key: 'longMaxValue',
              type: 'integer',
              value: '9223372036854775807',
            },
            {
              key: 'flagValue',
              type: 'boolean',
              value: 'true',
            },
            {
              key: 'base64',
              type: 'binary',
              value: 'base64:BQbtKNoM',
            },
          ]);

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(DATA, 1));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: DATA.type,
            version: 1,
            senderPublicKey,
            fee: 500000,
            chainId: 84,
            data: DATA.data.data,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('SetScript', function () {
      async function checkScript(script: string) {
        expect(SetScriptTransactionScreen.contentScript).toHaveText(script);
      }

      async function checkSetScriptTitle(title: string) {
        expect(SetScriptTransactionScreen.scriptTitle).toHaveText(title);
      }

      it('Rejected', async function () {
        await performSignTransaction(SET_SCRIPT);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkSetScriptTitle('Set Script');
        await checkScript('base64:BQbtKNoM');

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(SET_SCRIPT);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: SET_SCRIPT.type,
          version: 2,
          senderPublicKey,
          chainId: 84,
          fee: 500000,
          script: SET_SCRIPT.data.script,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      it('Copying script to the clipboard');
      it('Set');
      it('Cancel');

      describe('without script', function () {
        it('Rejected', async function () {
          await performSignTransaction(SET_SCRIPT_WITHOUT_SCRIPT);

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkSetScriptTitle('Remove Account Script');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(SET_SCRIPT_WITHOUT_SCRIPT);
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: SET_SCRIPT_WITHOUT_SCRIPT.type,
            version: 2,
            senderPublicKey,
            chainId: 84,
            fee: 500000,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            script: null,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.script).toBe(null);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(SET_SCRIPT, 1));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkSetScriptTitle('Set Script');
          await checkScript('base64:BQbtKNoM');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(SET_SCRIPT, 1));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: SET_SCRIPT.type,
            version: 1,
            senderPublicKey,
            chainId: 84,
            fee: 500000,
            script: SET_SCRIPT.data.script,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('Sponsorship', function () {
      async function checkSponsorshipTitle(title: string) {
        expect(SponsorshipTransactionScreen.title).toHaveText(title);
      }

      async function checkSponsorshipAmount(amount: string) {
        expect(SponsorshipTransactionScreen.amount).toHaveText(amount);
      }

      async function checkSponsorshipAsset(asset: string) {
        expect(SponsorshipTransactionScreen.asset).toHaveText(asset);
      }

      it('Rejected', async function () {
        await performSignTransaction(SPONSORSHIP);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkSponsorshipTitle('Set Sponsorship');
        await checkSponsorshipAmount('123456790 NonScriptToken');

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(SPONSORSHIP);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: SPONSORSHIP.type,
          version: 2,
          senderPublicKey,
          minSponsoredAssetFee: SPONSORSHIP.data.minSponsoredAssetFee.amount,
          assetId: SPONSORSHIP.data.minSponsoredAssetFee.assetId,
          fee: 500000,
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      describe('removal', function () {
        it('Rejected', async function () {
          await performSignTransaction(SPONSORSHIP_REMOVAL);

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkSponsorshipTitle('Disable Sponsorship');
          await checkSponsorshipAsset('NonScriptToken');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(SPONSORSHIP_REMOVAL);
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: SPONSORSHIP_REMOVAL.type,
            version: 2,
            senderPublicKey,
            minSponsoredAssetFee: null,
            assetId: SPONSORSHIP_REMOVAL.data.minSponsoredAssetFee.assetId,
            fee: 500000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(SPONSORSHIP, 1));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkSponsorshipTitle('Set Sponsorship');
          await checkSponsorshipAmount('123456790 NonScriptToken');

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(SPONSORSHIP, 1));
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: SPONSORSHIP.type,
            version: 1,
            senderPublicKey,
            minSponsoredAssetFee: SPONSORSHIP.data.minSponsoredAssetFee.amount,
            assetId: SPONSORSHIP.data.minSponsoredAssetFee.assetId,
            fee: 500000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('SetAssetScript', function () {
      async function checkAssetName(asset: string) {
        expect(AssetScriptTransactionScreen.asset).toHaveText(asset);
      }

      async function checkScript(script: string) {
        expect(AssetScriptTransactionScreen.script).toHaveText(script);
      }

      it('Rejected', async function () {
        await performSignTransaction(SET_ASSET_SCRIPT);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkAssetName('NonScriptToken');
        await checkScript('base64:BQbtKNoM');

        await checkTxFee('1.004 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(SET_ASSET_SCRIPT);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: SET_ASSET_SCRIPT.type,
          version: 2,
          senderPublicKey,
          assetId: SET_ASSET_SCRIPT.data.assetId,
          chainId: 84,
          fee: 100400000,
          script: SET_ASSET_SCRIPT.data.script,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      it('Copying script to the clipboard');

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction(setTxVersion(SET_ASSET_SCRIPT, 1));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkAssetName('NonScriptToken');
          await checkScript('base64:BQbtKNoM');

          await checkTxFee('1.004 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(SET_ASSET_SCRIPT, 1));

          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: SET_ASSET_SCRIPT.type,
            version: 1,
            senderPublicKey,
            assetId: SET_ASSET_SCRIPT.data.assetId,
            chainId: 84,
            fee: 100400000,
            script: SET_ASSET_SCRIPT.data.script,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('InvokeScript', function () {
      async function checkPaymentsTitle(title: string) {
        expect(InvokeScriptTransactionScreen.paymentsTitle).toHaveText(title);
      }

      async function checkDApp(dApp: string) {
        expect(InvokeScriptTransactionScreen.dApp).toHaveText(dApp);
      }

      async function checkFunction(fn: string) {
        expect(InvokeScriptTransactionScreen.function).toHaveText(fn);
      }

      async function checkArgs(args: Array<{ type: string; value: string }>) {
        const invokeArguments =
          await InvokeScriptTransactionScreen.getArguments();

        const actualArgs = await Promise.all(
          invokeArguments.map(async it => {
            const type = await it.type.getText();
            const value = await it.value.getText();
            return {
              type,
              value,
            };
          })
        );

        expect(actualArgs).toStrictEqual(args);
      }

      async function checkPayments(payments: string[]) {
        const invokePayments =
          await InvokeScriptTransactionScreen.getPayments();

        const actualPayments = await Promise.all(
          invokePayments.map(async it => it.root.getText())
        );

        expect(actualPayments).toStrictEqual(payments);
      }

      it('Rejected', async function () {
        await performSignTransaction(INVOKE_SCRIPT);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkPaymentsTitle('2 Payments');
        await checkDApp(INVOKE_SCRIPT.data.dApp);
        await checkFunction(INVOKE_SCRIPT.data.call.function);

        await checkArgs([
          {
            type: 'integer',
            value: '42',
          },
          {
            type: 'boolean',
            value: 'false',
          },
          {
            type: 'string',
            value: '"hello"',
          },
        ]);

        await checkPayments(['0.00000001 WAVES', '1 NonScriptToken']);

        await checkTxFee('0.005 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(INVOKE_SCRIPT);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: INVOKE_SCRIPT.type,
          version: 2,
          senderPublicKey,
          dApp: INVOKE_SCRIPT.data.dApp,
          call: INVOKE_SCRIPT.data.call,
          payment: INVOKE_SCRIPT.data.payment,
          fee: 500000,
          feeAssetId: null,
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });

      // TODO this checks should be into unittests
      it('dApp: address / alias');
      it('Function name at max length');
      it('Default function call');
      it('Maximum number of arguments');
      it('Arguments of all types (primitives and List of unions)');
      describe('Payment', function () {
        it('Zero count');
        it('Maximum count');
        it('Waves / asset / smart asset');
      });

      describe('without call', function () {
        it('Rejected', async function () {
          await performSignTransaction(INVOKE_SCRIPT_WITHOUT_CALL);

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkPaymentsTitle('No Payments');
          await checkDApp(INVOKE_SCRIPT_WITHOUT_CALL.data.dApp);
          await checkFunction('default');
          await checkArgs([]);
          await checkPayments([]);
          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(INVOKE_SCRIPT_WITHOUT_CALL);
          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: INVOKE_SCRIPT_WITHOUT_CALL.type,
            version: 2,
            senderPublicKey,
            dApp: 'alias:T:chris',
            payment: INVOKE_SCRIPT_WITHOUT_CALL.data.payment,
            fee: 500000,
            feeAssetId: null,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await performSignTransaction(setTxVersion(INVOKE_SCRIPT as any, 1));

          expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
          expect(CommonTransaction.accountName).toHaveText('rich');
          expect(CommonTransaction.originNetwork).toHaveText('Testnet');

          await checkPaymentsTitle('2 Payments');
          await checkDApp(INVOKE_SCRIPT.data.dApp);
          await checkFunction(INVOKE_SCRIPT.data.call.function);

          await checkArgs([
            {
              type: 'integer',
              value: '42',
            },
            {
              type: 'boolean',
              value: 'false',
            },
            {
              type: 'string',
              value: '"hello"',
            },
          ]);

          await checkPayments(['0.00000001 WAVES', '1 NonScriptToken']);

          await checkTxFee('0.005 WAVES');

          await CommonTransaction.rejectButton.click();
          await FinalTransactionScreen.closeButton.click();
        });

        it('Approved', async function () {
          await performSignTransaction(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setTxVersion(INVOKE_SCRIPT as any, 1)
          );

          await CommonTransaction.approveButton.click();
          await FinalTransactionScreen.closeButton.click();

          await browser.switchToWindow(tabOrigin);
          const [status, approveResult] = await getSignTransactionResult();

          expect(status).toBe('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: INVOKE_SCRIPT.type,
            version: 1,
            senderPublicKey,
            dApp: INVOKE_SCRIPT.data.dApp,
            call: INVOKE_SCRIPT.data.call,
            payment: INVOKE_SCRIPT.data.payment,
            fee: 500000,
            feeAssetId: null,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).toBe(true);
        });
      });
    });

    describe('UpdateAssetInfo', function () {
      async function checkAssetId(assetId: string) {
        expect(UpdateAssetInfoTransactionScreen.assetId).toHaveText(assetId);
      }

      async function checkAssetName(assetName: string) {
        expect(UpdateAssetInfoTransactionScreen.assetName).toHaveText(
          assetName
        );
      }

      async function checkAssetDescription(description: string) {
        expect(UpdateAssetInfoTransactionScreen.assetDescription).toHaveText(
          description
        );
      }

      async function checkFee(fee: string) {
        expect(UpdateAssetInfoTransactionScreen.fee).toHaveText(fee);
      }

      it('Rejected', async function () {
        await performSignTransaction(UPDATE_ASSET_INFO);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkAssetId(UPDATE_ASSET_INFO.data.assetId);
        await checkAssetName(UPDATE_ASSET_INFO.data.name);

        await checkAssetDescription(UPDATE_ASSET_INFO.data.description);

        await checkFee('0.001 WAVES');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignTransaction(UPDATE_ASSET_INFO);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const [status, approveResult] = await getSignTransactionResult();

        expect(status).toBe('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: UPDATE_ASSET_INFO.type,
          version: 1 as const,
          senderPublicKey,
          name: UPDATE_ASSET_INFO.data.name,
          description: UPDATE_ASSET_INFO.data.description,
          assetId: UPDATE_ASSET_INFO.data.assetId,
          fee: 100000,
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).toBe(true);
      });
    });
  });

  describe('Order', function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createOrder = (tx: any) => {
      KeeperWallet.signOrder(tx).then(
        result => {
          window.result = result;
        },
        () => {
          window.result = null;
        }
      );
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cancelOrder = (tx: any) => {
      KeeperWallet.signCancelOrder(tx).then(
        result => {
          window.result = result;
        },
        () => {
          window.result = null;
        }
      );
    };

    async function performSignOrder(
      script: (
        tx: Parameters<typeof KeeperWallet['signTransaction']>[0]
      ) => void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tx: any
    ) {
      await browser.switchToWindow(tabOrigin);
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.execute(script, tx);
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    describe('Create', function () {
      async function checkCreateOrderTitle(title: string) {
        expect(CreateOrderTransaction.orderTitle).toHaveText(title);
      }

      async function checkCreateOrderTitleAmount(amount: string) {
        expect(CreateOrderTransaction.orderAmount).toHaveText(amount);
      }

      async function checkCreateOrderTitlePrice(price: string) {
        expect(CreateOrderTransaction.orderPriceTitle).toHaveText(price);
      }

      async function checkCreateOrderPrice(price: string) {
        expect(CreateOrderTransaction.orderPrice).toHaveText(price);
      }

      async function checkCreateOrderMatcherPublicKey(
        matcherPublicKey: string
      ) {
        expect(CreateOrderTransaction.orderMatcherPublicKey).toHaveText(
          matcherPublicKey
        );
      }

      async function checkCreateOrderFee(fee: string) {
        expect(CreateOrderTransaction.createOrderFee).toHaveText(fee);
      }

      describe('version 3', () => {
        describe('basic', () => {
          const INPUT = {
            type: 1002,
            data: {
              matcherPublicKey: '7kPFrHDiGw1rCm7LPszuECwWYL3dMf6iMifLRDJQZMzy',
              orderType: 'sell',
              expiration: Date.now() + 100000,
              amount: {
                tokens: '100',
                assetId: 'WAVES',
              },
              price: {
                tokens: '0.01',
                assetId: '7sP5abE9nGRwZxkgaEXgkQDZ3ERBcm9PLHixaUE5SYoT',
              },
              matcherFee: {
                tokens: '0.03',
                assetId: 'WAVES',
              },
            },
          };

          it('Rejected', async function () {
            await performSignOrder(createOrder, INPUT);

            expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
            expect(CommonTransaction.accountName).toHaveText('rich');
            expect(CommonTransaction.originNetwork).toHaveText('Testnet');

            await checkCreateOrderTitle('Sell: WAVES/NonScriptToken');
            await checkCreateOrderTitleAmount('-100.00000000 WAVES');
            await checkCreateOrderTitlePrice('+0 NonScriptToken');
            await checkCreateOrderPrice('0 NonScriptToken');
            await checkCreateOrderMatcherPublicKey(INPUT.data.matcherPublicKey);
            await checkCreateOrderFee('0.03 WAVES');

            await CommonTransaction.rejectButton.click();
            await FinalTransactionScreen.closeButton.click();
          });

          it('Approved', async function () {
            await performSignOrder(createOrder, INPUT);
            await CommonTransaction.approveButton.click();
            await FinalTransactionScreen.closeButton.click();

            await browser.switchToWindow(tabOrigin);
            const approveResult = await browser.execute(() => window.result);

            const parsedApproveResult = parse(approveResult);

            const expectedApproveResult = {
              orderType: INPUT.data.orderType,
              version: 3,
              assetPair: {
                amountAsset: INPUT.data.amount.assetId,
                priceAsset: INPUT.data.price.assetId,
              },
              price: 0,
              amount: 10000000000,
              matcherFee: 3000000,
              matcherPublicKey: INPUT.data.matcherPublicKey,
              senderPublicKey,
              matcherFeeAssetId: null,
            };

            const bytes = binary.serializeOrder({
              ...expectedApproveResult,
              expiration: parsedApproveResult.expiration,
              timestamp: parsedApproveResult.timestamp,
            });

            expect(parsedApproveResult).toMatchObject(expectedApproveResult);
            expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

            expect(
              verifySignature(
                senderPublicKey,
                bytes,
                parsedApproveResult.proofs[0]
              )
            ).toBe(true);
          });
        });

        describe('with price precision conversion', function () {
          const INPUT = {
            type: 1002,
            data: {
              matcherPublicKey: '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy',
              orderType: 'buy',
              expiration: Date.now() + 100000,
              amount: {
                tokens: '1.000000',
                assetId: '5Sh9KghfkZyhjwuodovDhB6PghDUGBHiAPZ4MkrPgKtX',
              },
              price: {
                tokens: '1.014002',
                assetId: '25FEqEjRkqK6yCkiT7Lz6SAYz7gUFCtxfCChnrVFD5AT',
              },
              matcherFee: {
                tokens: '0.04077612',
                assetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
              },
            },
          };

          it('Rejected', async function () {
            await performSignOrder(createOrder, INPUT);

            expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
            expect(CommonTransaction.accountName).toHaveText('rich');
            expect(CommonTransaction.originNetwork).toHaveText('Testnet');

            await checkCreateOrderTitle('Buy: Tether USD/USD-Nea272c');
            await checkCreateOrderTitleAmount('+1.000000 Tether USD');
            await checkCreateOrderTitlePrice('-1.014002 USD-Nea272c');
            await checkCreateOrderPrice('1.014002 USD-Nea272c');
            await checkCreateOrderMatcherPublicKey(INPUT.data.matcherPublicKey);
            await checkCreateOrderFee('0.04077612 TXW-DEVa4f6df');

            await CommonTransaction.rejectButton.click();
            await FinalTransactionScreen.closeButton.click();
          });

          it('Approved', async function () {
            await performSignOrder(createOrder, INPUT);

            await CommonTransaction.approveButton.click();
            await FinalTransactionScreen.closeButton.click();

            await browser.switchToWindow(tabOrigin);
            const approveResult = await browser.execute(() => window.result);

            const parsedApproveResult = parse(approveResult);

            const expectedApproveResult = {
              orderType: INPUT.data.orderType,
              version: 3,
              assetPair: {
                amountAsset: INPUT.data.amount.assetId,
                priceAsset: INPUT.data.price.assetId,
              },
              price: 101400200,
              amount: 1000000,
              matcherFee: 4077612,
              matcherPublicKey: INPUT.data.matcherPublicKey,
              senderPublicKey,
              matcherFeeAssetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
            };

            const bytes = binary.serializeOrder({
              ...expectedApproveResult,
              expiration: parsedApproveResult.expiration,
              timestamp: parsedApproveResult.timestamp,
            });

            expect(parsedApproveResult).toMatchObject(expectedApproveResult);
            expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

            expect(
              verifySignature(
                senderPublicKey,
                bytes,
                parsedApproveResult.proofs[0]
              )
            ).toBe(true);
          });
        });
      });

      describe('version 4', () => {
        describe('with assetDecimals priceMode', function () {
          const INPUT = {
            type: 1002,
            data: {
              version: 4,
              matcherPublicKey: '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy',
              orderType: 'buy' as const,
              expiration: Date.now() + 100000,
              priceMode: 'assetDecimals',
              amount: {
                tokens: '1.000000',
                assetId: '5Sh9KghfkZyhjwuodovDhB6PghDUGBHiAPZ4MkrPgKtX',
              },
              price: {
                tokens: '1.014002',
                assetId: '25FEqEjRkqK6yCkiT7Lz6SAYz7gUFCtxfCChnrVFD5AT',
              },
              matcherFee: {
                tokens: '0.04077612',
                assetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
              },
            },
          };

          it('Rejected', async function () {
            await performSignOrder(createOrder, INPUT);

            expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
            expect(CommonTransaction.accountName).toHaveText('rich');
            expect(CommonTransaction.originNetwork).toHaveText('Testnet');

            await checkCreateOrderTitle('Buy: Tether USD/USD-Nea272c');
            await checkCreateOrderTitleAmount('+1.000000 Tether USD');
            await checkCreateOrderTitlePrice('-1.014002 USD-Nea272c');
            await checkCreateOrderPrice('1.014002 USD-Nea272c');
            await checkCreateOrderMatcherPublicKey(INPUT.data.matcherPublicKey);
            await checkCreateOrderFee('0.04077612 TXW-DEVa4f6df');

            await CommonTransaction.rejectButton.click();
            await FinalTransactionScreen.closeButton.click();
          });

          it('Approved', async function () {
            await performSignOrder(createOrder, INPUT);

            await CommonTransaction.approveButton.click();
            await FinalTransactionScreen.closeButton.click();

            await browser.switchToWindow(tabOrigin);
            const approveResult = await browser.execute(() => window.result);

            const parsedApproveResult = parse(approveResult);

            const expectedApproveResult = {
              chainId: 84,
              orderType: INPUT.data.orderType,
              version: 4 as const,
              assetPair: {
                amountAsset: INPUT.data.amount.assetId,
                priceAsset: INPUT.data.price.assetId,
              },
              price: 101400200,
              priceMode: 'assetDecimals' as const,
              amount: 1000000,
              matcherFee: 4077612,
              matcherPublicKey: INPUT.data.matcherPublicKey,
              senderPublicKey,
              matcherFeeAssetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
            };

            const bytes = orderToProtoBytes({
              ...expectedApproveResult,
              expiration: parsedApproveResult.expiration,
              timestamp: parsedApproveResult.timestamp,
            });

            expect(parsedApproveResult).toMatchObject(expectedApproveResult);
            expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

            expect(
              verifySignature(
                senderPublicKey,
                bytes,
                parsedApproveResult.proofs[0]
              )
            ).toBe(true);
          });
        });

        describe('with fixedDecimals priceMode', function () {
          const INPUT = {
            type: 1002,
            data: {
              version: 4,
              matcherPublicKey: '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy',
              orderType: 'buy' as const,
              expiration: Date.now() + 100000,
              priceMode: 'fixedDecimals',
              amount: {
                tokens: '1.000000',
                assetId: '5Sh9KghfkZyhjwuodovDhB6PghDUGBHiAPZ4MkrPgKtX',
              },
              price: {
                tokens: '1.014002',
                assetId: '25FEqEjRkqK6yCkiT7Lz6SAYz7gUFCtxfCChnrVFD5AT',
              },
              matcherFee: {
                tokens: '0.04077612',
                assetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
              },
            },
          };

          it('Rejected', async function () {
            await performSignOrder(createOrder, INPUT);

            expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
            expect(CommonTransaction.accountName).toHaveText('rich');
            expect(CommonTransaction.originNetwork).toHaveText('Testnet');

            await checkCreateOrderTitle('Buy: Tether USD/USD-Nea272c');
            await checkCreateOrderTitleAmount('+1.000000 Tether USD');
            await checkCreateOrderTitlePrice('-1.014002 USD-Nea272c');
            await checkCreateOrderPrice('1.014002 USD-Nea272c');
            await checkCreateOrderMatcherPublicKey(INPUT.data.matcherPublicKey);
            await checkCreateOrderFee('0.04077612 TXW-DEVa4f6df');

            await CommonTransaction.rejectButton.click();
            await FinalTransactionScreen.closeButton.click();
          });

          it('Approved', async function () {
            await performSignOrder(createOrder, INPUT);

            await CommonTransaction.approveButton.click();
            await FinalTransactionScreen.closeButton.click();

            await browser.switchToWindow(tabOrigin);
            const approveResult = await browser.execute(() => window.result);

            const parsedApproveResult = parse(approveResult);

            const expectedApproveResult = {
              chainId: 84,
              orderType: INPUT.data.orderType,
              version: 4 as const,
              assetPair: {
                amountAsset: INPUT.data.amount.assetId,
                priceAsset: INPUT.data.price.assetId,
              },
              price: 101400200,
              priceMode: 'fixedDecimals' as const,
              amount: 1000000,
              matcherFee: 4077612,
              matcherPublicKey: INPUT.data.matcherPublicKey,
              senderPublicKey,
              matcherFeeAssetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
            };

            const bytes = orderToProtoBytes({
              ...expectedApproveResult,
              expiration: parsedApproveResult.expiration,
              timestamp: parsedApproveResult.timestamp,
            });

            expect(parsedApproveResult).toMatchObject(expectedApproveResult);
            expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

            expect(
              verifySignature(
                senderPublicKey,
                bytes,
                parsedApproveResult.proofs[0]
              )
            ).toBe(true);
          });
        });

        describe('without priceMode', function () {
          const INPUT = {
            type: 1002,
            data: {
              version: 4,
              matcherPublicKey: '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy',
              orderType: 'buy' as const,
              expiration: Date.now() + 100000,
              amount: {
                tokens: '1.000000',
                assetId: '5Sh9KghfkZyhjwuodovDhB6PghDUGBHiAPZ4MkrPgKtX',
              },
              price: {
                tokens: '1.014002',
                assetId: '25FEqEjRkqK6yCkiT7Lz6SAYz7gUFCtxfCChnrVFD5AT',
              },
              matcherFee: {
                tokens: '0.04077612',
                assetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
              },
            },
          };

          it('Rejected', async function () {
            await performSignOrder(createOrder, INPUT);

            expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
            expect(CommonTransaction.accountName).toHaveText('rich');
            expect(CommonTransaction.originNetwork).toHaveText('Testnet');

            await checkCreateOrderTitle('Buy: Tether USD/USD-Nea272c');
            await checkCreateOrderTitleAmount('+1.000000 Tether USD');
            await checkCreateOrderTitlePrice('-1.014002 USD-Nea272c');
            await checkCreateOrderPrice('1.014002 USD-Nea272c');
            await checkCreateOrderMatcherPublicKey(INPUT.data.matcherPublicKey);
            await checkCreateOrderFee('0.04077612 TXW-DEVa4f6df');

            await CommonTransaction.rejectButton.click();
            await FinalTransactionScreen.closeButton.click();
          });

          it('Approved', async function () {
            await performSignOrder(createOrder, INPUT);

            await CommonTransaction.approveButton.click();
            await FinalTransactionScreen.closeButton.click();

            await browser.switchToWindow(tabOrigin);
            const approveResult = await browser.execute(() => window.result);

            const parsedApproveResult = parse(approveResult);

            const expectedApproveResult = {
              chainId: 84,
              orderType: INPUT.data.orderType,
              version: 4 as const,
              assetPair: {
                amountAsset: INPUT.data.amount.assetId,
                priceAsset: INPUT.data.price.assetId,
              },
              price: 101400200,
              priceMode: 'fixedDecimals' as const,
              amount: 1000000,
              matcherFee: 4077612,
              matcherPublicKey: INPUT.data.matcherPublicKey,
              senderPublicKey,
              matcherFeeAssetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
            };

            const bytes = orderToProtoBytes({
              ...expectedApproveResult,
              expiration: parsedApproveResult.expiration,
              timestamp: parsedApproveResult.timestamp,
            });

            expect(parsedApproveResult).toMatchObject(expectedApproveResult);
            expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));

            expect(
              verifySignature(
                senderPublicKey,
                bytes,
                parsedApproveResult.proofs[0]
              )
            ).toBe(true);
          });
        });
      });
    });

    describe('Cancel', function () {
      const INPUT = {
        type: 1003,
        data: {
          id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap',
        },
      };

      async function checkOrderId(orderId: string) {
        expect(CancelOrderTransactionScreen.orderId).toHaveText(orderId);
      }

      it('Rejected', async function () {
        await performSignOrder(cancelOrder, INPUT);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkOrderId(INPUT.data.id);

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignOrder(cancelOrder, INPUT);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const approveResult = await browser.execute(() => window.result);

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          orderId: INPUT.data.id,
          sender: senderPublicKey,
        };

        const bytes = cancelOrderParamsToBytes(expectedApproveResult);

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.signature)
        ).toBe(true);
      });
    });
  });

  describe('Multiple transactions package', function () {
    async function performSignTransactionPackage(
      tx: Array<Parameters<typeof KeeperWallet['signTransaction']>[0]>,
      name: string
    ) {
      await browser.switchToWindow(tabOrigin);
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await browser.execute(
        (
          // eslint-disable-next-line @typescript-eslint/no-shadow
          tx: Array<Parameters<typeof KeeperWallet['signTransaction']>[0]>,
          // eslint-disable-next-line @typescript-eslint/no-shadow
          name: string
        ) => {
          KeeperWallet.signTransactionPackage(tx, name).then(
            result => {
              window.result = result;
            },
            () => {
              window.result = null;
            }
          );
        },
        tx,
        name
      );
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    async function checkPackageCountTitle(title: string) {
      expect(PackageTransactionScreen.packageCountTitle).toHaveText(title);
    }

    async function checkPackageAmounts(amounts: string[]) {
      const actualAmounts = await Promise.all(
        await PackageTransactionScreen.packageAmounts.map(
          async it => await it.getText()
        )
      );
      expect(actualAmounts).toStrictEqual(amounts);
    }

    async function checkPackageFees(fees: string[]) {
      const actualFees = await Promise.all(
        await PackageTransactionScreen.packageFees.map(
          async it => await it.getText()
        )
      );
      expect(actualFees).toStrictEqual(fees);
    }

    it('Rejected', async function () {
      await performSignTransactionPackage(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PACKAGE as any,
        'Test package'
      );

      expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
      expect(CommonTransaction.accountName).toHaveText('rich');
      expect(CommonTransaction.originNetwork).toHaveText('Testnet');

      await checkPackageCountTitle('7 Transactions');

      await checkPackageAmounts([
        '+92233720368.54775807 ShortToken',
        '-123456790 NonScriptToken',
        '+123456790 NonScriptToken',
        '-123456790 NonScriptToken',
        '-1.23456790 WAVES',
        '+0.00000001 WAVES',
        '-0.00000001 WAVES',
        '-1 NonScriptToken',
      ]);

      await checkPackageFees(['1.029 WAVES', '0.005 WAVES']);

      await PackageTransactionScreen.showTransactionsButton.click();
      expect(await PackageTransactionScreen.getPackageItems()).toHaveLength(7);

      const [issue, transfer, reissue, burn, lease, cancelLease, invokeScript] =
        await PackageTransactionScreen.getPackageItems();

      expect(issue.type).toHaveText('Issue Smart Token');
      expect(issue.amount).toHaveText('92233720368.54775807 ShortToken');
      expect(issue.description).toHaveText('Full description of ShortToken');
      expect(issue.decimals).toHaveText('8');
      expect(issue.reissuable).toHaveText('Reissuable');
      expect(issue.contentScript).toHaveText('base64:BQbtKNoM');
      expect(issue.fee).toHaveText('1.004 WAVES');

      expect(transfer.transferAmount).toHaveText('-123456790 NonScriptToken');
      expect(transfer.recipient).toHaveText('3N5HNJz5otiU...BVv5HhYLdhiD');
      expect(transfer.attachmentContent).toHaveText('base64:BQbtKNoM');
      expect(transfer.fee).toHaveText('0.005 WAVES');

      expect(reissue.reissueAmount).toHaveText('+123456790 NonScriptToken');
      expect(reissue.fee).toHaveText('0.005 WAVES');

      expect(burn.burnAmount).toHaveText('-123456790 NonScriptToken');
      expect(burn.fee).toHaveText('0.005 WAVES');

      expect(lease.leaseAmount).toHaveText('1.23456790 WAVES');
      expect(lease.leaseRecipient).toHaveText('3N5HNJz5otiU...BVv5HhYLdhiD');
      expect(lease.fee).toHaveText('0.005 WAVES');

      expect(cancelLease.cancelLeaseAmount).toHaveText('0.00000001 WAVES');
      expect(cancelLease.cancelLeaseRecipient).toHaveText('alias:T:merry');
      expect(cancelLease.fee).toHaveText('0.005 WAVES');

      expect(invokeScript.invokeScriptPaymentsTitle).toHaveText('2 Payments');
      expect(invokeScript.invokeScriptDApp).toHaveText(INVOKE_SCRIPT.data.dApp);
      expect(invokeScript.invokeScriptFunction).toHaveText(
        INVOKE_SCRIPT.data.call.function
      );

      const invokeArguments = await invokeScript.getInvokeArguments();
      const actualArgs = await Promise.all(
        invokeArguments.map(async it => {
          const type = await it.type.getText();
          const value = await it.value.getText();
          return { type, value };
        })
      );
      expect(actualArgs).toStrictEqual([
        {
          type: 'integer',
          value: '42',
        },
        {
          type: 'boolean',
          value: 'false',
        },
        {
          type: 'string',
          value: '"hello"',
        },
      ]);

      const actualPayments = await Promise.all(
        await invokeScript.invokeScriptPaymentItems.map(async it =>
          it.getText()
        )
      );
      expect(actualPayments).toStrictEqual([
        '0.00000001 WAVES',
        '1 NonScriptToken',
      ]);

      expect(invokeScript.fee).toHaveText('0.005 WAVES');

      await CommonTransaction.rejectButton.click();
      await FinalTransactionScreen.closeButton.click();
    });

    it('Approved', async function () {
      await performSignTransactionPackage(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PACKAGE as any,
        'Test package'
      );

      await CommonTransaction.approveButton.click();
      await FinalTransactionScreen.closeButton.click();

      await browser.switchToWindow(tabOrigin);
      const approveResult = (await browser.execute(
        () => window.result
      )) as string[];

      expect(approveResult).toHaveLength(7);

      const parsedApproveResult = approveResult.map<{
        id: string;
        proofs: string[];
        timestamp: number;
      }>(parse);

      const expectedApproveResult0 = {
        type: ISSUE.type,
        version: 3,
        senderPublicKey,
        name: ISSUE.data.name,
        description: ISSUE.data.description,
        quantity: ISSUE.data.quantity,
        script: ISSUE.data.script,
        decimals: ISSUE.data.precision,
        reissuable: ISSUE.data.reissuable,
        fee: 100400000,
        chainId: 84,
      };

      const bytes0 = makeTxBytes({
        ...expectedApproveResult0,
        timestamp: parsedApproveResult[0].timestamp,
      });

      expect(parsedApproveResult[0]).toMatchObject(expectedApproveResult0);
      expect(parsedApproveResult[0].id).toBe(base58Encode(blake2b(bytes0)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes0,
          parsedApproveResult[0].proofs[0]
        )
      ).toBe(true);

      const expectedApproveResult1 = {
        type: TRANSFER.type,
        version: 3,
        senderPublicKey,
        assetId: TRANSFER.data.amount.assetId,
        recipient: TRANSFER.data.recipient,
        amount: TRANSFER.data.amount.amount,
        attachment: '3ke2ct1rnYr52Y1jQvzNG',
        fee: 500000,
        feeAssetId: null,
        chainId: 84,
      };

      const bytes1 = makeTxBytes({
        ...expectedApproveResult1,
        timestamp: parsedApproveResult[1].timestamp,
      });

      expect(parsedApproveResult[1]).toMatchObject(expectedApproveResult1);
      expect(parsedApproveResult[1].id).toBe(base58Encode(blake2b(bytes1)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes1,
          parsedApproveResult[1].proofs[0]
        )
      ).toBe(true);

      const expectedApproveResult2 = {
        type: REISSUE.type,
        version: 3,
        senderPublicKey,
        assetId: REISSUE.data.assetId,
        quantity: REISSUE.data.quantity,
        reissuable: REISSUE.data.reissuable,
        chainId: 84,
        fee: 500000,
      };

      const bytes2 = makeTxBytes({
        ...expectedApproveResult2,
        timestamp: parsedApproveResult[2].timestamp,
      });

      expect(parsedApproveResult[2]).toMatchObject(expectedApproveResult2);
      expect(parsedApproveResult[2].id).toBe(base58Encode(blake2b(bytes2)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes2,
          parsedApproveResult[2].proofs[0]
        )
      ).toBe(true);

      const expectedApproveResult3 = {
        type: BURN.type,
        version: 3,
        senderPublicKey,
        assetId: BURN.data.assetId,
        amount: BURN.data.amount,
        chainId: 84,
        fee: 500000,
      };

      const bytes3 = makeTxBytes({
        ...expectedApproveResult3,
        timestamp: parsedApproveResult[3].timestamp,
      });

      expect(parsedApproveResult[3]).toMatchObject(expectedApproveResult3);
      expect(parsedApproveResult[3].id).toBe(base58Encode(blake2b(bytes3)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes3,
          parsedApproveResult[3].proofs[0]
        )
      ).toBe(true);

      const expectedApproveResult4 = {
        type: LEASE.type,
        version: 3,
        senderPublicKey,
        amount: LEASE.data.amount,
        recipient: LEASE.data.recipient,
        fee: 500000,
        chainId: 84,
      };

      const bytes4 = makeTxBytes({
        ...expectedApproveResult4,
        timestamp: parsedApproveResult[4].timestamp,
      });

      expect(parsedApproveResult[4]).toMatchObject(expectedApproveResult4);
      expect(parsedApproveResult[4].id).toBe(base58Encode(blake2b(bytes4)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes4,
          parsedApproveResult[4].proofs[0]
        )
      ).toBe(true);

      const expectedApproveResult5 = {
        type: CANCEL_LEASE.type,
        version: 3,
        senderPublicKey,
        leaseId: CANCEL_LEASE.data.leaseId,
        fee: 500000,
        chainId: 84,
      };

      const bytes5 = makeTxBytes({
        ...expectedApproveResult5,
        timestamp: parsedApproveResult[5].timestamp,
      });

      expect(parsedApproveResult[5]).toMatchObject(expectedApproveResult5);
      expect(parsedApproveResult[5].id).toBe(base58Encode(blake2b(bytes5)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes5,
          parsedApproveResult[5].proofs[0]
        )
      ).toBe(true);

      const expectedApproveResult6 = {
        type: INVOKE_SCRIPT.type,
        version: 2,
        senderPublicKey,
        dApp: INVOKE_SCRIPT.data.dApp,
        call: INVOKE_SCRIPT.data.call,
        payment: INVOKE_SCRIPT.data.payment,
        fee: 500000,
        feeAssetId: null,
        chainId: 84,
      };

      const bytes6 = makeTxBytes({
        ...expectedApproveResult6,
        timestamp: parsedApproveResult[6].timestamp,
      });

      expect(parsedApproveResult[6]).toMatchObject(expectedApproveResult6);
      expect(parsedApproveResult[6].id).toBe(base58Encode(blake2b(bytes6)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes6,
          parsedApproveResult[6].proofs[0]
        )
      ).toBe(true);
    });
  });

  describe('Custom data', function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function performSignCustomData(data: any) {
      await browser.switchToWindow(tabOrigin);
      const { waitForNewWindows } = await Windows.captureNewWindows();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-shadow
      await browser.execute((data: any) => {
        KeeperWallet.signCustomData(data).then(
          result => {
            window.result = JSON.stringify(result);
          },
          () => {
            window.result = null;
          }
        );
      }, data);
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    describe('Version 1', function () {
      async function checkData(script: string) {
        expect(DataTransactionScreen.contentScript).toHaveText(script);
      }

      it('Rejected', async function () {
        await performSignCustomData(CUSTOM_DATA_V1);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkData('base64:AADDEE==');

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignCustomData(CUSTOM_DATA_V1);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const approveResult = (await browser.execute(
          () => window.result
        )) as string;
        const parsedApproveResult = JSON.parse(approveResult);

        const expectedApproveResult = {
          binary: CUSTOM_DATA_V1.binary,
          version: CUSTOM_DATA_V1.version,
          publicKey: senderPublicKey,
          hash: 'BddvukE8EsQ22TC916wr9hxL5MTinpcxj7cKmyQFu1Qj',
        };

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);

        expect(
          verifySignature(
            senderPublicKey,
            serializeCustomData(expectedApproveResult),
            parsedApproveResult.signature
          )
        ).toBe(true);
      });
    });

    describe('Version 2', function () {
      async function checkDataEntries(
        entries: Array<{ key: string; type: string; value: string }>
      ) {
        const actualItems = await Promise.all(
          (
            await DataTransactionScreen.getDataRows()
          ).map(async it => {
            const key = await it.key.getText();
            const type = await it.type.getText();
            const value = await it.value.getText();
            return {
              key,
              type,
              value,
            };
          })
        );

        expect(actualItems).toStrictEqual(entries);
      }

      it('Rejected', async function () {
        await performSignCustomData(CUSTOM_DATA_V2);

        expect(CommonTransaction.originAddress).toHaveText(WHITELIST[3]);
        expect(CommonTransaction.accountName).toHaveText('rich');
        expect(CommonTransaction.originNetwork).toHaveText('Testnet');

        await checkDataEntries([
          {
            key: 'stringValue',
            type: 'string',
            value: 'Lorem ipsum dolor sit amet',
          },
          {
            key: 'longMaxValue',
            type: 'integer',
            value: '9223372036854775807',
          },
          {
            key: 'flagValue',
            type: 'boolean',
            value: 'true',
          },
          {
            key: 'base64',
            type: 'binary',
            value: 'base64:BQbtKNoM',
          },
        ]);

        await CommonTransaction.rejectButton.click();
        await FinalTransactionScreen.closeButton.click();
      });

      it('Approved', async function () {
        await performSignCustomData(CUSTOM_DATA_V2);
        await CommonTransaction.approveButton.click();
        await FinalTransactionScreen.closeButton.click();

        await browser.switchToWindow(tabOrigin);
        const approveResult = (await browser.execute(
          () => window.result
        )) as string;

        const parsedApproveResult = JSON.parse(approveResult);

        const expectedApproveResult = {
          data: CUSTOM_DATA_V2.data,
          version: CUSTOM_DATA_V2.version,
          publicKey: senderPublicKey,
          hash: 'CntDRDubtuhwBKsmCTtZzMLVF9TFK6hLoWP424V8Zz2K',
        };

        expect(parsedApproveResult).toMatchObject(expectedApproveResult);

        expect(
          verifySignature(
            senderPublicKey,
            serializeCustomData(expectedApproveResult),
            parsedApproveResult.signature
          )
        ).toBe(true);
      });
    });
  });
});
