import {
  base58Decode,
  base58Encode,
  blake2b,
  verifySignature,
} from '@keeper-wallet/waves-crypto';
import { BigNumber } from '@waves/bignumber';
import { binary } from '@waves/marshall';
import Long from 'long';

import { JSONbn } from '../src/_core/jsonBn';
import {
  type MessageInputCancelOrder,
  type MessageInputCustomData,
  type MessageInputOrder,
  type MessageInputTx,
} from '../src/messages/types';
import {
  makeAuthBytes,
  makeCancelOrderBytes,
  makeCustomDataBytes,
  makeOrderBytes,
  makeTxBytes,
} from '../src/messages/utils';
import { ContentScript } from './helpers/ContentScript';
import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { Network } from './helpers/flows/Network';
import { HomeScreen } from './helpers/HomeScreen';
import { AssetScriptTransactionScreen } from './helpers/messages/AssetScriptTransactionScreen';
import { AuthMessageScreen } from './helpers/messages/AuthMessageScreen';
import { BurnTransactionScreen } from './helpers/messages/BurnTransactionScreen';
import { CancelOrderTransactionScreen } from './helpers/messages/CancelOrderTransactionScreen';
import { CommonTransaction } from './helpers/messages/CommonTransaction';
import { CreateAliasTransactionScreen } from './helpers/messages/CreateAliasTransactionScreen';
import { CreateOrderMessage } from './helpers/messages/CreateOrderMessage';
import { DataTransactionScreen } from './helpers/messages/DataTransactionScreen';
import { FinalTransactionScreen } from './helpers/messages/FinalTransactionScreen';
import { InvokeScriptTransactionScreen } from './helpers/messages/InvokeScriptTransactionScreen';
import { IssueTransactionScreen } from './helpers/messages/IssueTransactionScreen';
import { LeaseCancelTransactionScreen } from './helpers/messages/LeaseCancelTransactionScreen';
import { LeaseTransactionScreen } from './helpers/messages/LeaseTransactionScreen';
import { MassTransferTransactionScreen } from './helpers/messages/MassTransferTransactionScreen';
import { PackageTransactionScreen } from './helpers/messages/PackageTransactionScreen';
import { ReissueTransactionScreen } from './helpers/messages/ReissueTransactionScreen';
import { SetScriptTransactionScreen } from './helpers/messages/SetScriptTransactionScreen';
import { SponsorshipTransactionScreen } from './helpers/messages/SponsorshipTransactionScreen';
import { TransferTransactionScreen } from './helpers/messages/TransferTransactionScreen';
import { UpdateAssetInfoTransactionScreen } from './helpers/messages/UpdateAssetInfoTransactionScreen';
import { MessagesScreen } from './helpers/MessagesScreen';
import { Windows } from './helpers/Windows';
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

describe('Signature', function () {
  let tabOrigin: string;
  let messageWindow: string;

  const senderPublicKey = 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV';
  const senderPublicKeyBytes = base58Decode(senderPublicKey);

  before(async function () {
    await App.initVault();
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

    tabOrigin = tabAccounts;
    await browser.navigateTo(`https://${WHITELIST[3]}`);
  });

  after(async function () {
    const tabKeeper = (await browser.createWindow('tab')).handle;
    await App.closeBgTabs(tabKeeper);
    await App.resetVault();
  });

  const validateCommonFields = async (
    address: string,
    accountName: string,
    network: string
  ) => {
    await expect(CommonTransaction.originAddress).toHaveText(address);
    await expect(CommonTransaction.accountName).toHaveText(accountName);
    await expect(CommonTransaction.originNetwork).toHaveText(network);
  };

  async function checkThereAreNoMessages() {
    await browser.switchToWindow((await browser.createWindow('tab')).handle);
    await browser.openKeeperPopup();
    await expect(HomeScreen.root).toBeDisplayed();
    await browser.closeWindow();
  }

  function authMessageCall() {
    KeeperWallet.auth({ data: 'hello' });
  }

  async function rejectTransaction({ forever = false } = {}) {
    if (forever) {
      await AuthMessageScreen.rejectArrowButton.click();
      await AuthMessageScreen.addToBlacklistButton.click();
    } else {
      await CommonTransaction.rejectButton.click();
    }
    await FinalTransactionScreen.closeButton.click();
  }

  async function approveTransaction() {
    await CommonTransaction.approveButton.click();
    await browser.pause(100);
    await FinalTransactionScreen.closeButton.click();
  }

  async function getResult() {
    await browser.switchToWindow(tabOrigin);
    return JSON.parse(
      await browser.execute(() => {
        const { result } = window;
        delete window.result;
        return result;
      })
    );
  }

  async function validateRejectedResult({ data = 'rejected' } = {}) {
    const [status, result] = await getResult();
    expect(status).toBe('REJECTED');
    expect(result).toStrictEqual({
      message: 'User denied message',
      data,
      code: '10',
    });
  }

  describe('Stale messages removal', function () {
    async function triggerMessageWindow(
      func: () => void,
      options = { waitForNewWindow: true }
    ) {
      if (options.waitForNewWindow) {
        const { waitForNewWindows } = await Windows.captureNewWindows();
        await ContentScript.waitForKeeperWallet();
        await browser.execute(func);
        [messageWindow] = await waitForNewWindows(1);
      } else {
        await ContentScript.waitForKeeperWallet();
        await browser.execute(func);
      }
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    it('removes messages and closes window when tab is reloaded', async function () {
      await triggerMessageWindow(authMessageCall);
      await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

      await browser.switchToWindow(tabOrigin);
      await browser.refresh();
      await Windows.waitForWindowToClose(messageWindow);

      await checkThereAreNoMessages();
      await browser.switchToWindow(tabOrigin);
    });

    it('removes messages and closes window when the tab is closed', async function () {
      const newTabOrigin = (await browser.createWindow('tab')).handle;
      await browser.switchToWindow(newTabOrigin);
      await browser.navigateTo(`https://${CUSTOMLIST[1]}`);

      await triggerMessageWindow(authMessageCall);
      await validateCommonFields(CUSTOMLIST[1], 'rich', 'Testnet');

      await browser.switchToWindow(newTabOrigin);
      await browser.closeWindow();
      await browser.switchToWindow(tabOrigin);
      await Windows.waitForWindowToClose(messageWindow);

      await checkThereAreNoMessages();
      await browser.switchToWindow(tabOrigin);
    });

    it('does not close message window, if there are other messages left', async function () {
      await triggerMessageWindow(authMessageCall);
      await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

      const newTabOrigin = (await browser.createWindow('tab')).handle;
      await browser.switchToWindow(newTabOrigin);
      await browser.navigateTo(`https://${CUSTOMLIST[1]}`);

      await triggerMessageWindow(authMessageCall, { waitForNewWindow: false });
      expect(await MessagesScreen.messagesCards).toHaveLength(2);

      await browser.switchToWindow(newTabOrigin);
      await browser.closeWindow();

      await browser.switchToWindow(messageWindow);
      await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

      await rejectTransaction();
    });
  });

  describe('Permission request from origin', function () {
    async function performPermissionRequest() {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();
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

    it('Rejected', async function () {
      await browser.switchToWindow(tabOrigin);
      await browser.navigateTo(`https://${CUSTOMLIST[0]}`);
      await performPermissionRequest();
      await validateCommonFields(CUSTOMLIST[0], 'rich', 'Testnet');
      await rejectTransaction();
      await validateRejectedResult();
    });

    it('Reject forever', async function () {
      await browser.switchToWindow(tabOrigin);
      await browser.navigateTo(`https://${CUSTOMLIST[1]}`);
      await performPermissionRequest();
      await validateCommonFields(CUSTOMLIST[1], 'rich', 'Testnet');
      await rejectTransaction({ forever: true });
      await validateRejectedResult({ data: 'rejected_forever' });
    });

    it('Approved', async function () {
      await browser.switchToWindow(tabOrigin);
      await browser.navigateTo(`https://${CUSTOMLIST[0]}`);
      await performPermissionRequest();
      await approveTransaction();

      const [status, result] = await getResult();
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
        '1000': [1],
        '1001': [1],
        '1002': [4, 3, 2, 1],
        '1003': [1, 0],
      });
    });
  });

  describe('Authentication request from origin', function () {
    async function performAuthRequest() {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();
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

    it('Rejected', async function () {
      await browser.navigateTo(`https://${WHITELIST[3]}`);
      await performAuthRequest();
      await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');
      await rejectTransaction();
      const [status, result] = await getResult();
      expect(status).toBe('REJECTED');
      expect(result).toStrictEqual({
        code: '10',
        data: 'rejected',
        message: 'User denied message',
      });
    });

    it('Approved', async function () {
      await browser.switchToWindow(tabOrigin);
      await browser.navigateTo(`https://${WHITELIST[3]}`);
      await performAuthRequest();
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');
      const expectedApproveResult = {
        host: WHITELIST[3],
        prefix: 'WavesWalletAuthentication',
        address: '3MsX9C2MzzxE4ySF5aYcJoaiPfkyxZMg4cW',
        publicKey: senderPublicKey,
      };
      const bytes = makeAuthBytes({
        host: WHITELIST[3],
        data: 'generated auth data',
      });
      expect(result).toMatchObject(expectedApproveResult);
      expect(
        await verifySignature(
          senderPublicKeyBytes,
          bytes,
          base58Decode(result.signature)
        )
      ).toBe(true);
    });
  });

  describe('Matcher request', function () {
    const timestamp = Date.now();
    async function performMatcherRequest() {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();

      await browser.execute(
        // eslint-disable-next-line @typescript-eslint/no-shadow
        (senderPublicKey: string, timestamp: number) => {
          KeeperWallet.signRequest({
            data: {
              senderPublicKey,
              timestamp,
            },
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

    it('Rejected', async function () {
      await browser.switchToWindow(tabOrigin);
      await browser.navigateTo(`https://${WHITELIST[3]}`);
      await performMatcherRequest();
      await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');
      await rejectTransaction();
      await validateRejectedResult();
    });

    it('Approved', async function () {
      await browser.switchToWindow(tabOrigin);
      await browser.navigateTo(`https://${WHITELIST[3]}`);
      await performMatcherRequest();
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');
      const bytes = Uint8Array.of(
        ...senderPublicKeyBytes,
        ...new Uint8Array(Long.fromNumber(timestamp).toBytesBE())
      );
      expect(
        await verifySignature(senderPublicKeyBytes, bytes, base58Decode(result))
      ).toBe(true);
    });
  });

  describe('Transactions', function () {
    async function performSignTransaction(input: MessageInputTx) {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();
      await browser.execute((tx: MessageInputTx) => {
        KeeperWallet.signTransaction(tx).then(
          result => {
            window.result = JSON.stringify(['RESOLVED', result]);
          },
          err => {
            window.result = JSON.stringify(['REJECTED', err]);
          }
        );
      }, input);
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    function setTxVersion<T extends MessageInputTx>(tx: T, version: number): T {
      return { ...tx, data: { ...tx.data, version } };
    }

    describe('Issue', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(ISSUE);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(IssueTransactionScreen.issueType).toHaveText(
          'Issue Smart Token'
        );
        await expect(IssueTransactionScreen.issueAmount).toHaveText(
          '92233720368.54775807 ShortToken'
        );
        await expect(IssueTransactionScreen.issueDescription).toHaveText(
          ISSUE.data.description
        );
        await expect(IssueTransactionScreen.issueDecimals).toHaveText(
          `${ISSUE.data.precision}`
        );
        await expect(IssueTransactionScreen.issueReissuable).toHaveText(
          'Reissuable'
        );
        await expect(IssueTransactionScreen.contentScript).toHaveText(
          'base64:BQbtKNoM'
        );
        await expect(CommonTransaction.transactionFee).toHaveText(
          '1.004 WAVES'
        );

        await rejectTransaction();
        await validateRejectedResult();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(ISSUE);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: ISSUE.type,
          version: 3 as const,
          senderPublicKey,
          name: ISSUE.data.name,
          description: ISSUE.data.description,
          quantity: new BigNumber(ISSUE.data.quantity),
          script: ISSUE.data.script,
          decimals: ISSUE.data.precision,
          reissuable: ISSUE.data.reissuable,
          fee: 100400000,
          chainId: 84,
        };
        const bytes = makeTxBytes({
          ...expectedApproveResult,
          quantity: ISSUE.data.quantity,
          timestamp: parsedApproveResult.timestamp,
        });
        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
        expect(
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      it('Copying script to the clipboard');

      describe('without script', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(ISSUE_WITHOUT_SCRIPT);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(IssueTransactionScreen.issueType).toHaveText(
            'Issue Token'
          );
          await expect(IssueTransactionScreen.issueAmount).toHaveText(
            '92233720368.54775807 ShortToken'
          );
          await expect(IssueTransactionScreen.issueDescription).toHaveText(
            ISSUE.data.description
          );
          await expect(IssueTransactionScreen.issueDecimals).toHaveText(
            `${ISSUE.data.precision}`
          );
          await expect(IssueTransactionScreen.issueReissuable).toHaveText(
            'Reissuable'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '1.004 WAVES'
          );

          await rejectTransaction();
          await validateRejectedResult();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(ISSUE_WITHOUT_SCRIPT);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: ISSUE_WITHOUT_SCRIPT.type,
            version: 3 as const,
            senderPublicKey,
            name: ISSUE_WITHOUT_SCRIPT.data.name,
            description: ISSUE_WITHOUT_SCRIPT.data.description,
            quantity: new BigNumber(ISSUE_WITHOUT_SCRIPT.data.quantity),
            decimals: ISSUE_WITHOUT_SCRIPT.data.precision,
            reissuable: ISSUE_WITHOUT_SCRIPT.data.reissuable,
            fee: 100400000,
            chainId: 84,
          };
          const bytes = makeTxBytes({
            ...expectedApproveResult,
            quantity: ISSUE_WITHOUT_SCRIPT.data.quantity,
            script: null,
            timestamp: parsedApproveResult.timestamp,
          });
          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.script).toBe(null);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
          expect(
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(ISSUE, 2));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(IssueTransactionScreen.issueType).toHaveText(
            'Issue Smart Token'
          );
          await expect(IssueTransactionScreen.issueAmount).toHaveText(
            '92233720368.54775807 ShortToken'
          );
          await expect(IssueTransactionScreen.issueDescription).toHaveText(
            ISSUE.data.description
          );
          await expect(IssueTransactionScreen.issueDecimals).toHaveText(
            `${ISSUE.data.precision}`
          );
          await expect(IssueTransactionScreen.issueReissuable).toHaveText(
            'Reissuable'
          );
          await expect(IssueTransactionScreen.contentScript).toHaveText(
            'base64:BQbtKNoM'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '1.004 WAVES'
          );

          await rejectTransaction();
          await validateRejectedResult();
        });

        it('Approved', async function () {
          await performSignTransaction(setTxVersion(ISSUE, 2));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: ISSUE.type,
            version: 2 as const,
            senderPublicKey,
            name: ISSUE.data.name,
            description: ISSUE.data.description,
            quantity: new BigNumber(ISSUE.data.quantity),
            script: ISSUE.data.script,
            decimals: ISSUE.data.precision,
            reissuable: ISSUE.data.reissuable,
            fee: 100400000,
            chainId: 84,
          };
          const bytes = makeTxBytes({
            ...expectedApproveResult,
            quantity: ISSUE.data.quantity,
            timestamp: parsedApproveResult.timestamp,
          });
          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
          expect(
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('Transfer', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(TRANSFER);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(TransferTransactionScreen.transferAmount).toHaveText(
          '-123456790 NonScriptToken'
        );
        await expect(TransferTransactionScreen.recipient).toHaveText(
          '3N5HNJz5otiU...BVv5HhYLdhiD'
        );
        await expect(TransferTransactionScreen.attachmentContent).toHaveText(
          'base64:BQbtKNoM'
        );
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );
        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(TRANSFER);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: TRANSFER.type,
          version: 3 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
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
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(TRANSFER_WITHOUT_ATTACHMENT);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(TransferTransactionScreen.transferAmount).toHaveText(
            '-1.23456790 WAVES'
          );
          await expect(TransferTransactionScreen.recipient).toHaveText(
            'alias:T:alice'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(TRANSFER_WITHOUT_ATTACHMENT);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: TRANSFER_WITHOUT_ATTACHMENT.type,
            version: 3 as const,
            senderPublicKey,
            assetId: null,
            recipient: 'alias:T:alice',
            amount: TRANSFER_WITHOUT_ATTACHMENT.data.amount.amount,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(TRANSFER, 2));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(TransferTransactionScreen.transferAmount).toHaveText(
            '-123456790 NonScriptToken'
          );
          await expect(TransferTransactionScreen.recipient).toHaveText(
            '3N5HNJz5otiU...BVv5HhYLdhiD'
          );
          await expect(TransferTransactionScreen.attachmentContent).toHaveText(
            'base64:BQbtKNoM'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(TRANSFER, 2));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: TRANSFER.type,
            version: 2 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('Reissue', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(REISSUE);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(ReissueTransactionScreen.reissueAmount).toHaveText(
          '+123456790 NonScriptToken'
        );
        await expect(ReissueTransactionScreen.reissuableType).toHaveText(
          'Reissuable'
        );
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(REISSUE);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: REISSUE.type,
          version: 3 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      describe('with money-like', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(REISSUE_WITH_MONEY_LIKE);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(ReissueTransactionScreen.reissueAmount).toHaveText(
            '+123456790 NonScriptToken'
          );
          await expect(ReissueTransactionScreen.reissuableType).toHaveText(
            'Reissuable'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(REISSUE_WITH_MONEY_LIKE);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: REISSUE_WITH_MONEY_LIKE.type,
            version: 3 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(REISSUE, 2));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(ReissueTransactionScreen.reissueAmount).toHaveText(
            '+123456790 NonScriptToken'
          );
          await expect(ReissueTransactionScreen.reissuableType).toHaveText(
            'Reissuable'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(REISSUE, 2));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: REISSUE.type,
            version: 2 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('Burn', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(BURN);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(BurnTransactionScreen.burnAmount).toHaveText(
          '-123456790 NonScriptToken'
        );
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(BURN);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: BURN.type,
          version: 3 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      describe('with quantity instead of amount', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(BURN_WITH_QUANTITY);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(BurnTransactionScreen.burnAmount).toHaveText(
            '-123456790 NonScriptToken'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(BURN_WITH_QUANTITY);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: BURN_WITH_QUANTITY.type,
            version: 3 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(BURN, 2));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(CommonTransaction.originAddress).toHaveText(
            WHITELIST[3]
          );
          await expect(CommonTransaction.accountName).toHaveText('rich');
          await expect(CommonTransaction.originNetwork).toHaveText('Testnet');
          await expect(BurnTransactionScreen.burnAmount).toHaveText(
            '-123456790 NonScriptToken'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(BURN, 2));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: BURN.type,
            version: 2 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('Lease', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(LEASE);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(LeaseTransactionScreen.leaseAmount).toHaveText(
          '1.23456790 WAVES'
        );
        await expect(LeaseTransactionScreen.leaseRecipient).toHaveText(
          '3N5HNJz5otiU...BVv5HhYLdhiD'
        );
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(LEASE);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: LEASE.type,
          version: 3 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      describe('with alias', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(LEASE_WITH_ALIAS);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(LeaseTransactionScreen.leaseAmount).toHaveText(
            '1.23456790 WAVES'
          );
          await expect(LeaseTransactionScreen.leaseRecipient).toHaveText(
            'alias:T:bobby'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(LEASE_WITH_ALIAS);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: LEASE_WITH_ALIAS.type,
            version: 3 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with money-like', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(LEASE_WITH_MONEY_LIKE);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(LeaseTransactionScreen.leaseAmount).toHaveText(
            '1.23456790 WAVES'
          );
          await expect(LeaseTransactionScreen.leaseRecipient).toHaveText(
            '3N5HNJz5otiU...BVv5HhYLdhiD'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(LEASE_WITH_MONEY_LIKE);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: LEASE_WITH_MONEY_LIKE.type,
            version: 3 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(LEASE, 2));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(LeaseTransactionScreen.leaseAmount).toHaveText(
            '1.23456790 WAVES'
          );
          await expect(LeaseTransactionScreen.leaseRecipient).toHaveText(
            '3N5HNJz5otiU...BVv5HhYLdhiD'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(LEASE, 2));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: LEASE.type,
            version: 2 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('Cancel lease', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(CANCEL_LEASE);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(LeaseCancelTransactionScreen.cancelLeaseAmount).toHaveText(
          '0.00000001 WAVES'
        );
        await expect(
          LeaseCancelTransactionScreen.cancelLeaseRecipient
        ).toHaveText('alias:T:merry');
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(CANCEL_LEASE);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: CANCEL_LEASE.type,
          version: 3 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(CANCEL_LEASE, 2));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(
            LeaseCancelTransactionScreen.cancelLeaseAmount
          ).toHaveText('0.00000001 WAVES');
          await expect(
            LeaseCancelTransactionScreen.cancelLeaseRecipient
          ).toHaveText('alias:T:merry');
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(CANCEL_LEASE, 2));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: CANCEL_LEASE.type,
            version: 2 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('Alias', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(ALIAS);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(CreateAliasTransactionScreen.aliasValue).toHaveText(
          'test_alias'
        );
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(ALIAS);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: ALIAS.type,
          version: 3 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      // TODO this checks should be into unittests
      it('Minimum alias length');
      it('Maximum alias length');

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(ALIAS, 2));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(CreateAliasTransactionScreen.aliasValue).toHaveText(
            'test_alias'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(ALIAS, 2));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: ALIAS.type,
            version: 2 as const,
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
            base58Encode(
              blake2b(Uint8Array.of(bytes[0], ...bytes.subarray(36, -16)))
            )
          );
          expect(
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('MassTransfer', function () {
      async function checkMassTransferItems(
        items: Array<{ recipient: string; amount: string }>
      ) {
        const transferItems =
          await MassTransferTransactionScreen.getTransferItems();
        const actualItems = await Promise.all(
          transferItems.map(async transferItem => {
            const [recipient, amount] = await Promise.all([
              transferItem.recipient.getText(),
              transferItem.amount.getText(),
            ]);
            return { recipient, amount };
          })
        );
        expect(actualItems).toStrictEqual(items);
      }

      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(MASS_TRANSFER);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(
          MassTransferTransactionScreen.massTransferAmount
        ).toHaveText('-2 NonScriptToken');
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
        await expect(
          MassTransferTransactionScreen.massTransferAttachment
        ).toHaveText('base64:BQbtKNoM');
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.006 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(MASS_TRANSFER);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: MASS_TRANSFER.type,
          version: 2 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      describe('without attachment', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(MASS_TRANSFER_WITHOUT_ATTACHMENT);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(
            MassTransferTransactionScreen.massTransferAmount
          ).toHaveText('-0.00000123 WAVES');
          await checkMassTransferItems([
            {
              recipient: '3N5HNJz5otiU...BVv5HhYLdhiD',
              amount: '0.0000012',
            },
            {
              recipient: 'alias:T:merry',
              amount: '0.00000003',
            },
          ]);
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.006 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(MASS_TRANSFER_WITHOUT_ATTACHMENT);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: MASS_TRANSFER_WITHOUT_ATTACHMENT.type,
            version: 2 as const,
            senderPublicKey,
            assetId: null,
            transfers: [
              { amount: 120, recipient: '3N5HNJz5otiUavvoPrxMBrXBVv5HhYLdhiD' },
              { amount: 3, recipient: 'alias:T:merry' },
            ],
            fee: 600000,
            chainId: 84,
          };
          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });
          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
          expect(
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(MASS_TRANSFER, 1));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(
            MassTransferTransactionScreen.massTransferAmount
          ).toHaveText('-2 NonScriptToken');
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
          await expect(
            MassTransferTransactionScreen.massTransferAttachment
          ).toHaveText('base64:BQbtKNoM');
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.006 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(MASS_TRANSFER, 1));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: MASS_TRANSFER.type,
            version: 1 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
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
            const [key, type, value] = await Promise.all([
              it.key.getText(),
              it.type.getText(),
              it.value.getText(),
            ]);
            return { key, type, value };
          })
        );
        expect(actualItems).toStrictEqual(entries);
      }

      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(DATA);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

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
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(DATA);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: DATA.type,
          version: 2 as const,
          senderPublicKey,
          fee: 500000,
          chainId: 84,
          data: [
            {
              key: 'stringValue',
              type: 'string',
              value: 'Lorem ipsum dolor sit amet',
            },
            {
              key: 'longMaxValue',
              type: 'integer',
              value: new BigNumber('9223372036854775807'),
            },
            { key: 'flagValue', type: 'boolean', value: true },
            {
              key: 'base64',
              type: 'binary',
              value: 'base64:BQbtKNoM',
            },
          ],
        };
        const bytes = makeTxBytes({
          ...expectedApproveResult,
          data: DATA.data.data,
          timestamp: parsedApproveResult.timestamp,
        });
        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
        expect(
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(DATA, 1));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

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
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(DATA, 1));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: DATA.type,
            version: 1 as const,
            senderPublicKey,
            fee: 500000,
            chainId: 84,
            data: [
              {
                key: 'stringValue',
                type: 'string',
                value: 'Lorem ipsum dolor sit amet',
              },
              {
                key: 'longMaxValue',
                type: 'integer',
                value: new BigNumber('9223372036854775807'),
              },
              { key: 'flagValue', type: 'boolean', value: true },
              {
                key: 'base64',
                type: 'binary',
                value: 'base64:BQbtKNoM',
              },
            ],
          };
          const bytes = makeTxBytes({
            ...expectedApproveResult,
            data: DATA.data.data,
            timestamp: parsedApproveResult.timestamp,
          });
          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
          expect(
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('SetScript', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(SET_SCRIPT);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(SetScriptTransactionScreen.scriptTitle).toHaveText(
          'Set Script'
        );
        await expect(SetScriptTransactionScreen.contentScript).toHaveText(
          'base64:BQbtKNoM'
        );
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(SET_SCRIPT);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: SET_SCRIPT.type,
          version: 2 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      it('Copying script to the clipboard');
      it('Set');
      it('Cancel');

      describe('without script', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(SET_SCRIPT_WITHOUT_SCRIPT);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(SetScriptTransactionScreen.scriptTitle).toHaveText(
            'Remove Account Script'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(SET_SCRIPT_WITHOUT_SCRIPT);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: SET_SCRIPT_WITHOUT_SCRIPT.type,
            version: 2 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(SET_SCRIPT, 1));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(SetScriptTransactionScreen.scriptTitle).toHaveText(
            'Set Script'
          );
          await expect(SetScriptTransactionScreen.contentScript).toHaveText(
            'base64:BQbtKNoM'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(SET_SCRIPT, 1));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: SET_SCRIPT.type,
            version: 1 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('Sponsorship', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(SPONSORSHIP);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(SponsorshipTransactionScreen.title).toHaveText(
          'Set Sponsorship'
        );
        await expect(SponsorshipTransactionScreen.amount).toHaveText(
          '123456790 NonScriptToken'
        );
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(SPONSORSHIP);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: SPONSORSHIP.type,
          version: 2 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      describe('removal', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(SPONSORSHIP_REMOVAL);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(SponsorshipTransactionScreen.title).toHaveText(
            'Disable Sponsorship'
          );
          await expect(SponsorshipTransactionScreen.asset).toHaveText(
            'NonScriptToken'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(SPONSORSHIP_REMOVAL);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: SPONSORSHIP_REMOVAL.type,
            version: 2 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(SPONSORSHIP, 1));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(SponsorshipTransactionScreen.title).toHaveText(
            'Set Sponsorship'
          );
          await expect(SponsorshipTransactionScreen.amount).toHaveText(
            '123456790 NonScriptToken'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(SPONSORSHIP, 1));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: SPONSORSHIP.type,
            version: 1 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('SetAssetScript', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(SET_ASSET_SCRIPT);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(AssetScriptTransactionScreen.asset).toHaveText(
          'NonScriptToken'
        );
        await expect(AssetScriptTransactionScreen.script).toHaveText(
          'base64:BQbtKNoM'
        );
        await expect(CommonTransaction.transactionFee).toHaveText(
          '1.004 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(SET_ASSET_SCRIPT);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: SET_ASSET_SCRIPT.type,
          version: 2 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });

      it('Copying script to the clipboard');

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(SET_ASSET_SCRIPT, 1));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(AssetScriptTransactionScreen.asset).toHaveText(
            'NonScriptToken'
          );
          await expect(AssetScriptTransactionScreen.script).toHaveText(
            'base64:BQbtKNoM'
          );
          await expect(CommonTransaction.transactionFee).toHaveText(
            '1.004 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(SET_ASSET_SCRIPT, 1));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: SET_ASSET_SCRIPT.type,
            version: 1 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('InvokeScript', function () {
      async function checkArgs(args: Array<{ type: string; value: string }>) {
        const invokeArguments =
          await InvokeScriptTransactionScreen.getArguments();
        const actualArgs = await Promise.all(
          invokeArguments.map(async it => {
            const [type, value] = await Promise.all([
              it.type.getText(),
              it.value.getText(),
            ]);
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
          invokePayments.map(it => it.getText())
        );

        expect(actualPayments).toStrictEqual(payments);
      }

      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(INVOKE_SCRIPT);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(InvokeScriptTransactionScreen.paymentsTitle).toHaveText(
          '2 Payments'
        );
        await expect(InvokeScriptTransactionScreen.dApp).toHaveText(
          '3My2kBJaGfeM...3y8rAgfV2EAx'
        );
        await expect(InvokeScriptTransactionScreen.function).toHaveText(
          INVOKE_SCRIPT.data.call.function
        );
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
            value: 'hello',
          },
        ]);
        await checkPayments(['0.00000001 WAVES', '1 NonScriptToken']);
        await expect(CommonTransaction.transactionFee).toHaveText(
          '0.005 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(INVOKE_SCRIPT);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
        const expectedApproveResult = {
          type: INVOKE_SCRIPT.type,
          version: 2 as const,
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
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
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(INVOKE_SCRIPT_WITHOUT_CALL);
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(InvokeScriptTransactionScreen.paymentsTitle).toHaveText(
            'No Payments'
          );
          await expect(InvokeScriptTransactionScreen.dApp).toHaveText(
            `alias:T:${INVOKE_SCRIPT_WITHOUT_CALL.data.dApp}`
          );
          await expect(InvokeScriptTransactionScreen.function).toHaveText(
            'default'
          );
          await checkArgs([]);
          await checkPayments([]);
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(INVOKE_SCRIPT_WITHOUT_CALL);
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: INVOKE_SCRIPT_WITHOUT_CALL.type,
            version: 2 as const,
            senderPublicKey,
            dApp: 'alias:T:chris',
            payment: INVOKE_SCRIPT_WITHOUT_CALL.data.payment,
            fee: 500000,
            feeAssetId: null,
            chainId: 84,
          };
          const bytes = makeTxBytes({
            ...expectedApproveResult,
            call: null,
            timestamp: parsedApproveResult.timestamp,
          });
          expect(parsedApproveResult).toMatchObject(expectedApproveResult);
          expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
          expect(
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(INVOKE_SCRIPT, 1));
          await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

          await expect(InvokeScriptTransactionScreen.paymentsTitle).toHaveText(
            '2 Payments'
          );
          await expect(InvokeScriptTransactionScreen.dApp).toHaveText(
            '3My2kBJaGfeM...3y8rAgfV2EAx'
          );
          await expect(InvokeScriptTransactionScreen.function).toHaveText(
            INVOKE_SCRIPT.data.call.function
          );
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
              value: 'hello',
            },
          ]);
          await checkPayments(['0.00000001 WAVES', '1 NonScriptToken']);
          await expect(CommonTransaction.transactionFee).toHaveText(
            '0.005 WAVES'
          );

          await rejectTransaction();
        });

        it('Approved', async function () {
          await browser.switchToWindow(tabOrigin);
          await browser.navigateTo(`https://${WHITELIST[3]}`);
          await performSignTransaction(setTxVersion(INVOKE_SCRIPT, 1));
          await approveTransaction();

          const [status, result] = await getResult();
          expect(status).toBe('RESOLVED');
          const parsedApproveResult = JSONbn.parse(result);
          const expectedApproveResult = {
            type: INVOKE_SCRIPT.type,
            version: 1 as const,
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
            await verifySignature(
              senderPublicKeyBytes,
              bytes,
              base58Decode(parsedApproveResult.proofs[0])
            )
          ).toBe(true);
        });
      });
    });

    describe('UpdateAssetInfo', function () {
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(UPDATE_ASSET_INFO);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(UpdateAssetInfoTransactionScreen.assetId).toHaveText(
          UPDATE_ASSET_INFO.data.assetId
        );
        await expect(UpdateAssetInfoTransactionScreen.assetName).toHaveText(
          UPDATE_ASSET_INFO.data.name
        );
        await expect(
          UpdateAssetInfoTransactionScreen.assetDescription
        ).toHaveText(UPDATE_ASSET_INFO.data.description);
        await expect(UpdateAssetInfoTransactionScreen.fee).toHaveText(
          '0.001 WAVES'
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignTransaction(UPDATE_ASSET_INFO);
        await approveTransaction();

        const [status, result] = await getResult();
        expect(status).toBe('RESOLVED');
        const parsedApproveResult = JSONbn.parse(result);
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
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.proofs[0])
          )
        ).toBe(true);
      });
    });
  });

  describe('Order', function () {
    function createOrder(tx: MessageInputOrder) {
      KeeperWallet.signOrder(tx).then(
        result => {
          window.result = result;
        },
        () => {
          window.result = null;
        }
      );
    }

    function cancelOrder(tx: MessageInputCancelOrder) {
      KeeperWallet.signCancelOrder(tx).then(
        result => {
          window.result = result;
        },
        () => {
          window.result = null;
        }
      );
    }

    async function performSignOrder(
      script: (tx: MessageInputOrder) => void,
      tx: MessageInputOrder
    ) {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();
      await browser.execute(script, tx);
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    async function performSignCancelOrder(
      script: (tx: MessageInputCancelOrder) => void,
      tx: MessageInputCancelOrder
    ) {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();
      await browser.execute(script, tx);
      [messageWindow] = await waitForNewWindows(1);
      await browser.switchToWindow(messageWindow);
      await browser.refresh();
    }

    describe('Create', function () {
      describe('version 3', () => {
        describe('basic', () => {
          const INPUT = {
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
          } as const;

          it('Rejected', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

            await expect(CreateOrderMessage.orderTitle).toHaveText(
              'Sell: WAVES/NonScriptToken'
            );
            await expect(CreateOrderMessage.orderAmount).toHaveText(
              '-100.00000000 WAVES'
            );
            await expect(CreateOrderMessage.orderPriceTitle).toHaveText(
              '+0 NonScriptToken'
            );
            await expect(CreateOrderMessage.orderPrice).toHaveText(
              '0 NonScriptToken'
            );
            await expect(CreateOrderMessage.orderMatcherPublicKey).toHaveText(
              INPUT.data.matcherPublicKey
            );
            await expect(CreateOrderMessage.createOrderFee).toHaveText(
              '0.03 WAVES'
            );

            await rejectTransaction();
          });

          it('Approved', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await approveTransaction();

            const parsedApproveResult = await getResult();
            const expectedApproveResult = {
              orderType: INPUT.data.orderType,
              version: 3,
              assetPair: {
                amountAsset: null,
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
              await verifySignature(
                senderPublicKeyBytes,
                bytes,
                base58Decode(parsedApproveResult.proofs[0])
              )
            ).toBe(true);
          });
        });

        describe('with price precision conversion', function () {
          const INPUT = {
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
          } as const;

          it('Rejected', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

            await expect(CreateOrderMessage.orderTitle).toHaveText(
              'Buy: Tether USD/USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderAmount).toHaveText(
              '+1.000000 Tether USD'
            );
            await expect(CreateOrderMessage.orderPriceTitle).toHaveText(
              '-1.014002 USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderPrice).toHaveText(
              '1.014002 USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderMatcherPublicKey).toHaveText(
              INPUT.data.matcherPublicKey
            );
            await expect(CreateOrderMessage.createOrderFee).toHaveText(
              '0.04077612 TXW-DEVa4f6df'
            );

            await rejectTransaction();
          });

          it('Approved', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await approveTransaction();

            const parsedApproveResult = await getResult();
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
              await verifySignature(
                senderPublicKeyBytes,
                bytes,
                base58Decode(parsedApproveResult.proofs[0])
              )
            ).toBe(true);
          });
        });

        describe('with different decimals', function () {
          const INPUT = {
            data: {
              matcherPublicKey: '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy',
              orderType: 'buy',
              expiration: Date.now() + 100000,
              amount: {
                coins: 15637504,
                assetId: '5Sh9KghfkZyhjwuodovDhB6PghDUGBHiAPZ4MkrPgKtX',
              },
              price: {
                coins: 121140511,
                assetId: 'WAVES',
              },
              matcherFee: {
                tokens: '0.04077612',
                assetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
              },
            },
          } as const;

          it('Rejected', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

            await expect(CreateOrderMessage.orderTitle).toHaveText(
              'Buy: Tether USD/WAVES'
            );
            await expect(CreateOrderMessage.orderAmount).toHaveText(
              '+15.637504 Tether USD'
            );
            await expect(CreateOrderMessage.orderPriceTitle).toHaveText(
              '-18.94335225 WAVES'
            );
            await expect(CreateOrderMessage.orderPrice).toHaveText(
              '1.21140511 WAVES'
            );
            await expect(CreateOrderMessage.orderMatcherPublicKey).toHaveText(
              INPUT.data.matcherPublicKey
            );
            await expect(CreateOrderMessage.createOrderFee).toHaveText(
              '0.04077612 TXW-DEVa4f6df'
            );

            await rejectTransaction();
          });

          it('Approved', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await approveTransaction();

            const parsedApproveResult = await getResult();
            const expectedApproveResult = {
              orderType: INPUT.data.orderType,
              version: 3,
              assetPair: {
                amountAsset: INPUT.data.amount.assetId,
                priceAsset: null,
              },
              price: 12114051100,
              amount: 15637504,
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
              await verifySignature(
                senderPublicKeyBytes,
                bytes,
                base58Decode(parsedApproveResult.proofs[0])
              )
            ).toBe(true);
          });
        });
      });

      describe('version 4', () => {
        describe('with assetDecimals priceMode', function () {
          const INPUT = {
            data: {
              version: 4,
              matcherPublicKey: '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy',
              orderType: 'buy',
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
          } as const;

          it('Rejected', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

            await expect(CreateOrderMessage.orderTitle).toHaveText(
              'Buy: Tether USD/USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderAmount).toHaveText(
              '+1.000000 Tether USD'
            );
            await expect(CreateOrderMessage.orderPriceTitle).toHaveText(
              '-1.014002 USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderPrice).toHaveText(
              '1.014002 USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderMatcherPublicKey).toHaveText(
              INPUT.data.matcherPublicKey
            );
            await expect(CreateOrderMessage.createOrderFee).toHaveText(
              '0.04077612 TXW-DEVa4f6df'
            );

            await rejectTransaction();
          });

          it('Approved', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await approveTransaction();

            const parsedApproveResult = await getResult();
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
            const bytes = makeOrderBytes({
              ...expectedApproveResult,
              expiration: parsedApproveResult.expiration,
              timestamp: parsedApproveResult.timestamp,
            });
            expect(parsedApproveResult).toMatchObject(expectedApproveResult);
            expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
            expect(
              await verifySignature(
                senderPublicKeyBytes,
                bytes,
                base58Decode(parsedApproveResult.proofs[0])
              )
            ).toBe(true);
          });
        });

        describe('with fixedDecimals priceMode', function () {
          const INPUT = {
            data: {
              version: 4,
              matcherPublicKey: '8QUAqtTckM5B8gvcuP7mMswat9SjKUuafJMusEoSn1Gy',
              orderType: 'buy',
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
          } as const;

          it('Rejected', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

            await expect(CreateOrderMessage.orderTitle).toHaveText(
              'Buy: Tether USD/USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderAmount).toHaveText(
              '+1.000000 Tether USD'
            );
            await expect(CreateOrderMessage.orderPriceTitle).toHaveText(
              '-1.014002 USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderPrice).toHaveText(
              '1.014002 USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderMatcherPublicKey).toHaveText(
              INPUT.data.matcherPublicKey
            );
            await expect(CreateOrderMessage.createOrderFee).toHaveText(
              '0.04077612 TXW-DEVa4f6df'
            );

            await rejectTransaction();
          });

          it('Approved', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await approveTransaction();

            const parsedApproveResult = await getResult();
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
            const bytes = makeOrderBytes({
              ...expectedApproveResult,
              expiration: parsedApproveResult.expiration,
              timestamp: parsedApproveResult.timestamp,
            });
            expect(parsedApproveResult).toMatchObject(expectedApproveResult);
            expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
            expect(
              await verifySignature(
                senderPublicKeyBytes,
                bytes,
                base58Decode(parsedApproveResult.proofs[0])
              )
            ).toBe(true);
          });
        });

        describe('without priceMode', function () {
          const INPUT = {
            data: {
              version: 4,
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
          } as const;

          it('Rejected', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

            await expect(CreateOrderMessage.orderTitle).toHaveText(
              'Buy: Tether USD/USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderAmount).toHaveText(
              '+1.000000 Tether USD'
            );
            await expect(CreateOrderMessage.orderPriceTitle).toHaveText(
              '-1.014002 USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderPrice).toHaveText(
              '1.014002 USD-Nea272c'
            );
            await expect(CreateOrderMessage.orderMatcherPublicKey).toHaveText(
              INPUT.data.matcherPublicKey
            );
            await expect(CreateOrderMessage.createOrderFee).toHaveText(
              '0.04077612 TXW-DEVa4f6df'
            );

            await rejectTransaction();
          });

          it('Approved', async function () {
            await browser.switchToWindow(tabOrigin);
            await browser.navigateTo(`https://${WHITELIST[3]}`);
            await performSignOrder(createOrder, INPUT);
            await approveTransaction();

            const parsedApproveResult = await getResult();
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
            const bytes = makeOrderBytes({
              ...expectedApproveResult,
              expiration: parsedApproveResult.expiration,
              timestamp: parsedApproveResult.timestamp,
            });
            expect(parsedApproveResult).toMatchObject(expectedApproveResult);
            expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
            expect(
              await verifySignature(
                senderPublicKeyBytes,
                bytes,
                base58Decode(parsedApproveResult.proofs[0])
              )
            ).toBe(true);
          });
        });
      });
    });

    describe('Cancel', function () {
      const INPUT = {
        amountAsset: '',
        data: { id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap' },
        priceAsset: '',
      };

      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignCancelOrder(cancelOrder, INPUT);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(CancelOrderTransactionScreen.orderId).toHaveText(
          INPUT.data.id
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignCancelOrder(cancelOrder, INPUT);
        await approveTransaction();

        const parsedApproveResult = await getResult();
        const expectedApproveResult = {
          orderId: INPUT.data.id,
          sender: senderPublicKey,
        };
        const bytes = makeCancelOrderBytes(expectedApproveResult);
        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(
          await verifySignature(
            senderPublicKeyBytes,
            bytes,
            base58Decode(parsedApproveResult.signature)
          )
        ).toBe(true);
      });
    });
  });

  describe('Multiple transactions package', function () {
    async function performSignTransactionPackage(
      tx: MessageInputTx[],
      name: string
    ) {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();
      await browser.execute(
        (
          // eslint-disable-next-line @typescript-eslint/no-shadow
          tx: MessageInputTx[],
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
      await browser.switchToWindow(tabOrigin);
      await browser.navigateTo(`https://${WHITELIST[3]}`);
      await performSignTransactionPackage(PACKAGE, 'Test package');
      await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

      await expect(PackageTransactionScreen.packageCountTitle).toHaveText(
        '7 Transactions'
      );
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
      await checkPackageFees(['1.034 WAVES']);
      await PackageTransactionScreen.showTransactionsButton.click();
      expect(await PackageTransactionScreen.getPackageItems()).toHaveLength(7);

      const [issue, transfer, reissue, burn, lease, cancelLease, invokeScript] =
        await PackageTransactionScreen.getPackageItems();

      await expect(issue.type).toHaveText('Issue Smart Token');
      await expect(issue.amount).toHaveText('92233720368.54775807 ShortToken');
      await expect(issue.description).toHaveText(
        'Full description of ShortToken'
      );
      await expect(issue.decimals).toHaveText('8');
      await expect(issue.reissuable).toHaveText('Reissuable');
      await expect(issue.contentScript).toHaveText('base64:BQbtKNoM');
      await expect(issue.fee).toHaveText('1.004 WAVES');

      await expect(transfer.transferAmount).toHaveText(
        '-123456790 NonScriptToken'
      );
      await expect(transfer.recipient).toHaveText(
        '3N5HNJz5otiU...BVv5HhYLdhiD'
      );
      await expect(transfer.attachmentContent).toHaveText('base64:BQbtKNoM');
      await expect(transfer.fee).toHaveText('0.005 WAVES');

      await expect(reissue.reissueAmount).toHaveText(
        '+123456790 NonScriptToken'
      );
      await expect(reissue.fee).toHaveText('0.005 WAVES');

      await expect(burn.burnAmount).toHaveText('-123456790 NonScriptToken');
      await expect(burn.fee).toHaveText('0.005 WAVES');

      await expect(lease.leaseAmount).toHaveText('1.23456790 WAVES');
      await expect(lease.leaseRecipient).toHaveText(
        '3N5HNJz5otiU...BVv5HhYLdhiD'
      );
      await expect(lease.fee).toHaveText('0.005 WAVES');

      await expect(cancelLease.cancelLeaseAmount).toHaveText(
        '0.00000001 WAVES'
      );
      await expect(cancelLease.cancelLeaseRecipient).toHaveText(
        'alias:T:merry'
      );
      await expect(cancelLease.fee).toHaveText('0.005 WAVES');

      await expect(invokeScript.invokeScriptPaymentsTitle).toHaveText(
        '2 Payments'
      );
      await expect(invokeScript.invokeScriptDApp).toHaveText(
        '3My2kBJaGfeM...3y8rAgfV2EAx'
      );
      await expect(invokeScript.invokeScriptFunction).toHaveText(
        INVOKE_SCRIPT.data.call.function
      );

      const invokeArguments = await invokeScript.getInvokeArguments();
      const actualArgs = await Promise.all(
        invokeArguments.map(async it => {
          const [type, value] = await Promise.all([
            it.type.getText(),
            it.value.getText(),
          ]);
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
          value: 'hello',
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

      await expect(invokeScript.fee).toHaveText('0.005 WAVES');

      await rejectTransaction();
    });

    it('Approved', async function () {
      await browser.switchToWindow(tabOrigin);
      await browser.navigateTo(`https://${WHITELIST[3]}`);
      await performSignTransactionPackage(PACKAGE, 'Test package');
      await approveTransaction();

      await browser.switchToWindow(tabOrigin);
      const approvedResult = await browser.execute<string[], []>(
        () => window.result
      );
      expect(approvedResult).toHaveLength(7);

      const parsedApproveResult = approvedResult.map<{
        id: string;
        proofs: string[];
        timestamp: number;
      }>(result => JSONbn.parse(result));
      const expectedApproveResult0 = {
        type: ISSUE.type,
        version: 3 as const,
        senderPublicKey,
        name: ISSUE.data.name,
        description: ISSUE.data.description,
        quantity: new BigNumber(ISSUE.data.quantity),
        script: ISSUE.data.script,
        decimals: ISSUE.data.precision,
        reissuable: ISSUE.data.reissuable,
        fee: 100400000,
        chainId: 84,
      };
      const bytes0 = makeTxBytes({
        ...expectedApproveResult0,
        quantity: ISSUE.data.quantity,
        timestamp: parsedApproveResult[0].timestamp,
      });
      expect(parsedApproveResult[0]).toMatchObject(expectedApproveResult0);
      expect(parsedApproveResult[0].id).toBe(base58Encode(blake2b(bytes0)));
      expect(
        await verifySignature(
          senderPublicKeyBytes,
          bytes0,
          base58Decode(parsedApproveResult[0].proofs[0])
        )
      ).toBe(true);

      const expectedApproveResult1 = {
        type: TRANSFER.type,
        version: 3 as const,
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
        await verifySignature(
          senderPublicKeyBytes,
          bytes1,
          base58Decode(parsedApproveResult[1].proofs[0])
        )
      ).toBe(true);

      const expectedApproveResult2 = {
        type: REISSUE.type,
        version: 3 as const,
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
        await verifySignature(
          senderPublicKeyBytes,
          bytes2,
          base58Decode(parsedApproveResult[2].proofs[0])
        )
      ).toBe(true);

      const expectedApproveResult3 = {
        type: BURN.type,
        version: 3 as const,
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
        await verifySignature(
          senderPublicKeyBytes,
          bytes3,
          base58Decode(parsedApproveResult[3].proofs[0])
        )
      ).toBe(true);

      const expectedApproveResult4 = {
        type: LEASE.type,
        version: 3 as const,
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
        await verifySignature(
          senderPublicKeyBytes,
          bytes4,
          base58Decode(parsedApproveResult[4].proofs[0])
        )
      ).toBe(true);

      const expectedApproveResult5 = {
        type: CANCEL_LEASE.type,
        version: 3 as const,
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
        await verifySignature(
          senderPublicKeyBytes,
          bytes5,
          base58Decode(parsedApproveResult[5].proofs[0])
        )
      ).toBe(true);

      const expectedApproveResult6 = {
        type: INVOKE_SCRIPT.type,
        version: 2 as const,
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
        await verifySignature(
          senderPublicKeyBytes,
          bytes6,
          base58Decode(parsedApproveResult[6].proofs[0])
        )
      ).toBe(true);
    });
  });

  describe('Custom data', function () {
    async function performSignCustomData(data: MessageInputCustomData) {
      const { waitForNewWindows } = await Windows.captureNewWindows();
      await ContentScript.waitForKeeperWallet();
      // eslint-disable-next-line @typescript-eslint/no-shadow
      await browser.execute((data: MessageInputCustomData) => {
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
      it('Rejected', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignCustomData(CUSTOM_DATA_V1);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

        await expect(DataTransactionScreen.contentScript).toHaveText(
          'base64:AADDEE=='
        );

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignCustomData(CUSTOM_DATA_V1);
        await approveTransaction();

        const parsedApproveResult = await getResult();
        const expectedApproveResult = {
          binary: CUSTOM_DATA_V1.binary,
          version: CUSTOM_DATA_V1.version,
          publicKey: senderPublicKey,
          hash: 'BddvukE8EsQ22TC916wr9hxL5MTinpcxj7cKmyQFu1Qj',
        };
        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(
          await verifySignature(
            senderPublicKeyBytes,
            makeCustomDataBytes(expectedApproveResult),
            base58Decode(parsedApproveResult.signature)
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
            const [key, type, value] = await Promise.all([
              it.key.getText(),
              it.type.getText(),
              it.value.getText(),
            ]);
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
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignCustomData(CUSTOM_DATA_V2);
        await validateCommonFields(WHITELIST[3], 'rich', 'Testnet');

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

        await rejectTransaction();
      });

      it('Approved', async function () {
        await browser.switchToWindow(tabOrigin);
        await browser.navigateTo(`https://${WHITELIST[3]}`);
        await performSignCustomData(CUSTOM_DATA_V2);
        await approveTransaction();

        const parsedApproveResult = await getResult();
        const expectedApproveResult = {
          data: CUSTOM_DATA_V2.data,
          version: CUSTOM_DATA_V2.version,
          publicKey: senderPublicKey,
          hash: 'CntDRDubtuhwBKsmCTtZzMLVF9TFK6hLoWP424V8Zz2K',
        };
        expect(parsedApproveResult).toMatchObject(expectedApproveResult);
        expect(
          await verifySignature(
            senderPublicKeyBytes,
            makeCustomDataBytes(expectedApproveResult),
            base58Decode(parsedApproveResult.signature)
          )
        ).toBe(true);
      });
    });
  });
});
