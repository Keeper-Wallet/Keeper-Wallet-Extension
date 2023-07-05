import {
  base58Decode,
  base58Encode,
  blake2b,
  createAddress,
  createPrivateKey,
  createPublicKey,
  utf8Encode,
  verifySignature,
} from '@keeper-wallet/waves-crypto';
import waitForExpect from 'wait-for-expect';

import { JSONbn } from '../src/_core/jsonBn';
import { type MessageInputTx } from '../src/messages/types';
import { makeTxBytes } from '../src/messages/utils';
import { ContentScript } from './helpers/ContentScript';
import { CustomNetworkModal } from './helpers/CustomNetworkModal';
import { EmptyHomeScreen } from './helpers/EmptyHomeScreen';
import { AccountsHome } from './helpers/flows/AccountsHome';
import { App } from './helpers/flows/App';
import { Network } from './helpers/flows/Network';
import { HomeScreen } from './helpers/HomeScreen';
import { CommonTransaction } from './helpers/messages/CommonTransaction';
import { FinalTransactionScreen } from './helpers/messages/FinalTransactionScreen';
import { OtherAccountsScreen } from './helpers/OtherAccountsScreen';
import { Windows } from './helpers/Windows';
import {
  ISSUER_SEED,
  USER_1_SEED,
  USER_2_SEED,
  WHITELIST,
} from './utils/constants';
import {
  faucet,
  getNetworkByte,
  getTransactionStatus,
} from './utils/nodeInteraction';
import {
  ALIAS,
  BURN,
  CANCEL_LEASE,
  DATA,
  INVOKE_SCRIPT,
  ISSUE,
  LEASE,
  MASS_TRANSFER,
  REISSUE,
  SET_ASSET_SCRIPT,
  SET_SCRIPT,
  SET_SCRIPT_COMPILED,
  SPONSORSHIP,
  TRANSFER,
} from './utils/transactions';

const WAVES_TOKEN_SCALE = Math.pow(10, 8);
type Account = { address: string; publicKey: string };

describe('Publish', function () {
  const nodeUrl = 'http://localhost:6869';
  let chainId: number;
  let issuer: Account, user1: Account, user2: Account;
  let dAppTab: string;
  let messageWindow: string | null = null;

  let smartAssetId: string;
  let assetWithMaxValuesId: string;

  before(async function () {
    chainId = await getNetworkByte(nodeUrl);

    const issuerPrivateKeyBytes = await createPrivateKey(
      utf8Encode(ISSUER_SEED),
    );
    const issuerPublicKeyBytes = await createPublicKey(issuerPrivateKeyBytes);
    issuer = {
      address: base58Encode(createAddress(issuerPublicKeyBytes, chainId)),
      publicKey: base58Encode(issuerPublicKeyBytes),
    };

    const user1PrivateKeyBytes = await createPrivateKey(
      utf8Encode(USER_1_SEED),
    );
    const user1PublicKeyBytes = await createPublicKey(user1PrivateKeyBytes);
    user1 = {
      address: base58Encode(createAddress(user1PublicKeyBytes, chainId)),
      publicKey: base58Encode(user1PublicKeyBytes),
    };

    const user2PrivateKeyBytes = await createPrivateKey(
      utf8Encode(USER_2_SEED),
    );
    const user2PublicKeyBytes = await createPublicKey(user2PrivateKeyBytes);
    user2 = {
      address: base58Encode(createAddress(user2PublicKeyBytes, chainId)),
      publicKey: base58Encode(user2PublicKeyBytes),
    };
    await faucet({
      recipient: issuer.address,
      amount: 10 * WAVES_TOKEN_SCALE,
      nodeUrl,
      chainId,
    });
    await App.initVault();

    const tabKeeper = await browser.getWindowHandle();
    const { waitForNewWindows } = await Windows.captureNewWindows();
    await EmptyHomeScreen.addButton.click();
    const [tabAccounts] = await waitForNewWindows(1);

    await browser.switchToWindow(tabKeeper);
    await browser.closeWindow();

    await browser.switchToWindow(tabAccounts);
    await browser.refresh();

    await Network.switchTo('Custom');
    if (await CustomNetworkModal.root.isDisplayed()) {
      await CustomNetworkModal.addressInput.setValue(this.nodeUrl);
      await CustomNetworkModal.saveButton.click();
    }

    await AccountsHome.importAccount('user2', USER_2_SEED);
    await AccountsHome.importAccount('user1', USER_1_SEED);
    await AccountsHome.importAccount('issuer', ISSUER_SEED);

    dAppTab = (await browser.createWindow('tab')).handle;
    await browser.switchToWindow(dAppTab);
    await browser.navigateTo(`https://${WHITELIST[3]}`);

    await browser.switchToWindow(tabAccounts);
    await browser.closeWindow();

    await browser.switchToWindow(dAppTab);
  });

  after(async function () {
    const tabKeeper = (await browser.createWindow('tab')).handle;
    await App.closeBgTabs(tabKeeper);
    await browser.openKeeperPopup();
    await Network.switchTo('Mainnet');
    await App.resetVault();
  });

  async function performSignAndPublishTransaction(input: MessageInputTx) {
    const { waitForNewWindows } = await Windows.captureNewWindows();
    await ContentScript.waitForKeeperWallet();
    await browser.execute((tx: MessageInputTx) => {
      KeeperWallet.signAndPublishTransaction(tx).then(
        result => {
          window.result = JSON.stringify(['RESOLVED', result]);
        },
        err => {
          window.result = JSON.stringify(['REJECTED', err]);
        },
      );
    }, input);
    [messageWindow] = await waitForNewWindows(1);
    await browser.switchToWindow(messageWindow);
    await browser.refresh();
  }

  async function getResult() {
    await browser.switchToWindow(dAppTab);
    return JSON.parse(
      await browser.execute(() => {
        const { result } = window;
        delete window.result;
        return result;
      }),
    );
  }

  async function approveTransaction() {
    await CommonTransaction.approveButton.click();
    await FinalTransactionScreen.closeButton.click();
  }

  describe('Asset issue', () => {
    it('Asset with max values', async () => {
      const data = {
        name: '16 characters :)',
        description: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. ${'Aenean commodo ligula eget dolor. Aenean'.repeat(
          10,
        )}`,
        quantity: '9223372036854775807',
        precision: 8 as const,
        reissuable: true,
      };
      await performSignAndPublishTransaction({ ...ISSUE, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: ISSUE.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        decimals: data.precision,
        reissuable: data.reissuable,
        fee: '100000000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        quantity: data.quantity,
        script: null,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
      assetWithMaxValuesId = parsedApproveResult.assetId;
    });

    it('Asset with min values', async () => {
      const data = {
        name: 'Four',
        description: '',
        quantity: '1',
        precision: 0 as const,
        reissuable: false,
      };
      await performSignAndPublishTransaction({ ...ISSUE, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: ISSUE.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        decimals: data.precision,
        reissuable: data.reissuable,
        fee: '100000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        quantity: data.quantity,
        script: null,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Smart asset', async () => {
      const data = {
        name: 'Smart Asset',
        description: 'Asset with script',
        quantity: '100000000000',
        precision: 8 as const,
        reissuable: true,
        script: 'base64:BQbtKNoM',
      };
      await performSignAndPublishTransaction({ ...ISSUE, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: ISSUE.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        decimals: data.precision,
        reissuable: data.reissuable,
        script: data.script,
        fee: '100000000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        quantity: data.quantity,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);

      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
      smartAssetId = parsedApproveResult.assetId;
    });

    it('NFT', async () => {
      const data = {
        name: 'Non-fungible',
        description:
          'NFT is a non-reissuable asset with quantity 1 and decimals 0',
        quantity: '1',
        precision: 0 as const,
        reissuable: false,
        script: 'base64:BQbtKNoM',
      };
      await performSignAndPublishTransaction({ ...ISSUE, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: ISSUE.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        name: data.name,
        description: data.description,
        quantity: data.quantity,
        decimals: data.precision,
        reissuable: data.reissuable,
        script: data.script,
        fee: '100000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        quantity: data.quantity,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });
  });

  describe('Editing an asset', () => {
    it('Reissue', async () => {
      const data = {
        quantity: '777',
        assetId: smartAssetId,
        reissuable: false,
      };
      await performSignAndPublishTransaction({ ...REISSUE, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: REISSUE.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        assetId: data.assetId,
        quantity: data.quantity,
        reissuable: data.reissuable,
        fee: '500000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        quantity: data.quantity,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Burn', async () => {
      const data = {
        quantity: '100500',
        assetId: smartAssetId,
      };
      await performSignAndPublishTransaction({ ...BURN, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: BURN.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        assetId: data.assetId,
        amount: data.quantity,
        fee: '500000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Set asset script', async () => {
      const data = {
        assetId: smartAssetId,
        script: 'base64:BQQAAAAHJG1hdGNoMAUAAAACdHgGGDRbEA==',
      };
      await performSignAndPublishTransaction({ ...SET_ASSET_SCRIPT, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: SET_ASSET_SCRIPT.type,
        version: 2 as const,
        senderPublicKey: issuer.publicKey,
        assetId: data.assetId,
        fee: '100000000',
        script: data.script,
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Enable sponsorship fee', async () => {
      const data = {
        minSponsoredAssetFee: {
          amount: '10000000',
          assetId: assetWithMaxValuesId,
        },
      };
      await performSignAndPublishTransaction({ ...SPONSORSHIP, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: SPONSORSHIP.type,
        version: 2 as const,
        senderPublicKey: issuer.publicKey,
        minSponsoredAssetFee: data.minSponsoredAssetFee.amount,
        assetId: data.minSponsoredAssetFee.assetId,
        fee: '100000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Disable sponsorship fee', async () => {
      const data = {
        minSponsoredAssetFee: {
          amount: '0',
          assetId: assetWithMaxValuesId,
        },
      };
      await performSignAndPublishTransaction({ ...SPONSORSHIP, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: SPONSORSHIP.type,
        version: 2 as const,
        senderPublicKey: issuer.publicKey,
        minSponsoredAssetFee: null,
        assetId: data.minSponsoredAssetFee.assetId,
        fee: '100000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });
  });

  describe('Transfers', () => {
    it('Transfer', async () => {
      const data = {
        amount: {
          amount: '10050000000000',
          assetId: assetWithMaxValuesId,
        },
        recipient: user1.address,
        attachment: 'base64:BQbtKNoM',
      };
      await performSignAndPublishTransaction({ ...TRANSFER, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: TRANSFER.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        assetId: data.amount.assetId,
        recipient: data.recipient,
        amount: data.amount.amount,
        attachment: '3ke2ct1rnYr52Y1jQvzNG',
        fee: '100000',
        feeAssetId: null,
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Mass transfer', async () => {
      const data = {
        totalAmount: {
          assetId: null,
        },
        transfers: [
          { recipient: user1.address, amount: '10000000' },
          { recipient: user2.address, amount: '10000000' },
        ],
        attachment: 'base64:BQbtKNoM',
      };
      await performSignAndPublishTransaction({ ...MASS_TRANSFER, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: MASS_TRANSFER.type,
        version: 2 as const,
        senderPublicKey: issuer.publicKey,
        transfers: data.transfers,
        fee: '200000',
        attachment: '3ke2ct1rnYr52Y1jQvzNG',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        assetId: null,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });
  });

  describe('Record in the account data storage', () => {
    it('Write to Data storage', async () => {
      const data = {
        data: [
          {
            key: 'bool-entry',
            value: false,
            type: 'boolean' as const,
          },
          {
            key: 'str-entry',
            value: 'Some string',
            type: 'string' as const,
          },
          {
            key: 'binary',
            value: 'base64:AbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCdAbCd',
            type: 'binary' as const,
          },
          {
            key: 'integer',
            value: '20',
            type: 'integer' as const,
          },
        ],
      };

      await performSignAndPublishTransaction({ ...DATA, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: DATA.type,
        version: 2 as const,
        senderPublicKey: issuer.publicKey,
        data: data.data,
        fee: '100000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Write MAX values to Data storage', async () => {
      const strValueMax =
        `Sed ut perspiciatis unde omnis iste natus error ` +
        `sit voluptatem accusantium doloremque laudantium, totam rem aperiam, ${'eaque ipsa quae ab illo inventore\n'.repeat(
          217,
        )}`;
      const binValueMax = `base64:${Buffer.from(strValueMax).toString(
        'base64',
      )}`;
      const data = {
        data: [
          {
            key: 'bool-entry',
            value: true,
            type: 'boolean' as const,
          },
          {
            key: 'str-entry',
            value: strValueMax,
            type: 'string' as const,
          },
          {
            key: 'bin-entry',
            value: binValueMax,
            type: 'binary' as const,
          },
          {
            key: 'int-entry',
            value: '9223372036854775807',
            type: 'integer' as const,
          },
        ],
      };

      await performSignAndPublishTransaction({ ...DATA, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: DATA.type,
        version: 2 as const,
        senderPublicKey: issuer.publicKey,
        data: data.data,
        fee: '1500000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });
  });

  async function changeKeeperAccountAndClose(accountName: string) {
    const tab = (await browser.createWindow('tab')).handle;
    await browser.switchToWindow(tab);
    await browser.openKeeperPopup();
    await HomeScreen.otherAccountsButton.click();
    const account = await OtherAccountsScreen.getAccountByName(accountName);
    await account.root.click();
    await browser.closeWindow();
    await browser.switchToWindow(dAppTab);
  }

  describe('Installing the script on the account and calling it', () => {
    it('Set script', async () => {
      await changeKeeperAccountAndClose('user1');
      await performSignAndPublishTransaction(SET_SCRIPT_COMPILED);
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: SET_SCRIPT_COMPILED.type,
        version: 2 as const,
        senderPublicKey: user1.publicKey,
        script: SET_SCRIPT_COMPILED.data.script,
        fee: '300000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(user1.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Invoke script with payment', async function () {
      await changeKeeperAccountAndClose('issuer');

      const data = {
        dApp: user1.address,
        call: {
          function: 'deposit',
          args: [],
        },
        payment: [{ assetId: null, amount: '200000000' }],
      };

      await performSignAndPublishTransaction({ ...INVOKE_SCRIPT, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: INVOKE_SCRIPT.type,
        version: 2 as const,
        senderPublicKey: issuer.publicKey,
        dApp: data.dApp,
        call: data.call,
        payment: data.payment,
        fee: '500000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        feeAssetId: null,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Invoke with argument', async function () {
      const data = {
        dApp: user1.address,
        call: {
          function: 'withdraw',
          args: [{ type: 'integer' as const, value: '100' }],
        },
        payment: [],
      };

      await performSignAndPublishTransaction({ ...INVOKE_SCRIPT, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: INVOKE_SCRIPT.type,
        version: 2 as const,
        senderPublicKey: issuer.publicKey,
        dApp: data.dApp,
        call: data.call,
        payment: data.payment,
        fee: '500000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        feeAssetId: null,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Invoke with long arguments and payments list', async function () {
      const binLong = `base64:${btoa(
        new Uint8Array(
          Array(100).fill([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).flat(),
        ).toString(),
      )}`;

      const data = {
        dApp: user1.address,
        call: {
          function: 'allArgTypes',
          args: [
            { type: 'boolean' as const, value: true },
            { type: 'binary' as const, value: binLong },
            { type: 'integer' as const, value: '-9223372036854775808' },
            {
              type: 'string' as const,
              value: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. ${'Aenean commodo ligula eget dolor. Aenean'.repeat(
                3,
              )}`,
            },
            {
              type: 'list' as const,
              value: [
                { type: 'boolean' as const, value: true },
                { type: 'binary' as const, value: binLong },
                { type: 'integer' as const, value: '-9223372036854775808' },
                {
                  type: 'string' as const,
                  value: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit. ${'Aenean commodo ligula eget dolor. Aenean'.repeat(
                    3,
                  )}`,
                },
              ],
            },
          ],
        },
        payment: [
          { assetId: null, amount: '27000000' },
          { assetId: assetWithMaxValuesId, amount: '27000000' },
          { assetId: smartAssetId, amount: '27000000' },
          { assetId: null, amount: '200000' },
          { assetId: assetWithMaxValuesId, amount: '150000' },
          { assetId: smartAssetId, amount: '12222' },
          { assetId: null, amount: '1212' },
          { assetId: assetWithMaxValuesId, amount: '3434' },
          { assetId: smartAssetId, amount: '5656' },
          { assetId: null, amount: '50000000' },
        ],
      };

      await performSignAndPublishTransaction({ ...INVOKE_SCRIPT, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: INVOKE_SCRIPT.type,
        version: 2 as const,
        senderPublicKey: issuer.publicKey,
        dApp: data.dApp,
        call: data.call,
        payment: data.payment,
        fee: '500000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        feeAssetId: null,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });

    it('Remove script', async () => {
      await changeKeeperAccountAndClose('user1');
      await performSignAndPublishTransaction({ ...SET_SCRIPT, data: {} });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: SET_SCRIPT_COMPILED.type,
        version: 2 as const,
        senderPublicKey: user1.publicKey,
        script: null,
        fee: '100000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(user1.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });
  });

  describe('Leasing', () => {
    let leaseId: string;

    it('Lease', async () => {
      await changeKeeperAccountAndClose('issuer');

      const data = {
        amount: '1000',
        recipient: user2.address,
      };
      await performSignAndPublishTransaction({ ...LEASE, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: LEASE.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        amount: data.amount,
        recipient: data.recipient,
        fee: '100000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
      leaseId = parsedApproveResult.id;
    });

    it('Cancel lease', async () => {
      const data = { leaseId };
      await performSignAndPublishTransaction({ ...CANCEL_LEASE, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: CANCEL_LEASE.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        leaseId: data.leaseId,
        fee: '100000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });
  });

  describe('Aliases', () => {
    it('Create alias', async () => {
      const data = {
        alias: `test_${Date.now()}`,
      };

      await performSignAndPublishTransaction({ ...ALIAS, data });
      await approveTransaction();

      const [status, result] = await getResult();
      expect(status).toBe('RESOLVED');

      const parsedApproveResult = JSONbn.parse(result);
      const expectedApproveResult = {
        type: ALIAS.type,
        version: 3 as const,
        senderPublicKey: issuer.publicKey,
        alias: data.alias,
        fee: '100000',
        chainId,
      };
      const bytes = makeTxBytes({
        ...expectedApproveResult,
        timestamp: parsedApproveResult.timestamp,
      });

      expect(parsedApproveResult).toMatchObject(expectedApproveResult);
      expect(parsedApproveResult.id).toBe(base58Encode(blake2b(bytes)));
      expect(
        await verifySignature(
          base58Decode(issuer.publicKey),
          bytes,
          base58Decode(parsedApproveResult.proofs[0]),
        ),
      ).toBe(true);
      await waitForExpect(async () => {
        expect(
          await getTransactionStatus(parsedApproveResult.id, nodeUrl),
        ).toBe('confirmed');
      }, 15000);
    });
  });
});
