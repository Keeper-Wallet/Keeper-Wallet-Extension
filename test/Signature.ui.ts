import { binary, serializePrimitives } from '@waves/marshall';
import {
  base58Encode,
  blake2b,
  concat,
  verifySignature,
} from '@waves/ts-lib-crypto';
import { makeTxBytes, serializeCustomData } from '@waves/waves-transactions';
import { serializeAuthData } from '@waves/waves-transactions/dist/requests/auth';
import { cancelOrderParamsToBytes } from '@waves/waves-transactions/dist/requests/cancel-order';
import { expect } from 'chai';
import * as mocha from 'mocha';
import * as create from 'parse-json-bignumber';
import {
  App,
  CreateNewAccount,
  Network,
  Settings,
  Windows,
} from './utils/actions';
import { CUSTOMLIST, WHITELIST } from './utils/constants';
import { By, until } from 'selenium-webdriver';
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
import {
  CANCEL_ORDER,
  CREATE_ORDER,
  CREATE_ORDER_WITH_PRICE_PRECISION_CONVERSION,
} from './utils/orders';
import { CUSTOM_DATA_V1, CUSTOM_DATA_V2 } from './utils/customData';

const { parse } = create();

describe('Signature', function () {
  this.timeout(5 * 60 * 1000);

  let tabOrigin: string;
  let messageWindow: string | null = null;

  const senderPublicKey = 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV';

  before(async function () {
    await App.initVault.call(this);
    await Settings.setMaxSessionTimeout.call(this);
    await App.open.call(this);
    await Network.switchToAndCheck.call(this, 'Testnet');
    const tabKeeper = await this.driver.getWindowHandle();

    const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="addAccountBtn"]')),
        this.wait
      )
      .click();
    const [tabAccounts] = await waitForNewWindows(1);

    await this.driver.switchTo().window(tabKeeper);
    await this.driver.close();

    await this.driver.switchTo().window(tabAccounts);
    await this.driver.navigate().refresh();

    await CreateNewAccount.importAccount.call(
      this,
      'rich',
      'waves private node seed with waves tokens'
    );

    await this.driver.switchTo().newWindow('tab');
    tabOrigin = await this.driver.getWindowHandle();

    await this.driver.switchTo().window(tabAccounts);
    await this.driver.close();
    await this.driver.switchTo().window(tabOrigin);
    await this.driver.get(`https://${WHITELIST[3]}`);
  });

  after(async function () {
    await this.driver.switchTo().newWindow('tab');
    const tabKeeper = await this.driver.getWindowHandle();
    await App.closeBgTabs.call(this, tabKeeper);
    await App.resetVault.call(this);
  });

  async function checkOrigin(this: mocha.Context, expectedOrigin: string) {
    const originEl = await this.driver.wait(
      until.elementLocated(By.css('[class^="transactions-originAddress"]')),
      this.wait
    );

    const origin = await originEl.getText();

    expect(origin).to.equal(expectedOrigin);
  }

  async function checkAccountName(
    this: mocha.Context,
    expectedAccountName: string
  ) {
    const accountNameEl = await this.driver.wait(
      until.elementLocated(By.css('[class^="wallet-accountName"]')),
      this.wait
    );

    const accountName = await accountNameEl.getText();

    expect(accountName).to.equal(expectedAccountName);
  }

  async function checkNetworkName(
    this: mocha.Context,
    expectedNetworkName: string
  ) {
    const networkNameEl = await this.driver.wait(
      until.elementLocated(By.css('[class^="transactions-originNetwork"]')),
      this.wait
    );

    const networkName = await networkNameEl.getText();

    expect(networkName).to.equal(expectedNetworkName);
  }

  async function approveMessage(this: mocha.Context, wait = this.wait) {
    await this.driver
      .wait(until.elementLocated(By.css('#approve')), wait)
      .click();

    await this.driver.wait(
      until.elementLocated(By.css('.tx-approve-icon')),
      this.wait
    );
  }

  async function rejectMessage(this: mocha.Context, wait = this.wait) {
    await this.driver
      .wait(until.elementLocated(By.css('#reject')), wait)
      .click();

    await this.driver.wait(
      until.elementLocated(By.css('.tx-reject-icon')),
      this.wait
    );
  }

  async function closeMessage(this: mocha.Context) {
    await this.driver.findElement(By.css('#close')).click();
    expect(messageWindow).not.to.be.null;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await Windows.waitForWindowToClose.call(this, messageWindow!);
    messageWindow = null;
    await this.driver.switchTo().window(tabOrigin);
  }

  describe('Permission request from origin', function () {
    async function performPermissionRequest(this: mocha.Context) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(() => {
        KeeperWallet.initialPromise
          .then(api => api.publicState())
          .then(
            result => {
              window.result = JSON.stringify(['RESOLVED', result]);
            },
            err => {
              window.result = JSON.stringify(['REJECTED', err]);
            }
          );
      });
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();
    }

    async function getPermissionRequestResult(this: mocha.Context) {
      return JSON.parse(
        await this.driver.executeScript<string>(() => {
          const { result } = window;
          delete window.result;
          return result;
        })
      );
    }

    after(async function () {
      await this.driver.get(`https://${WHITELIST[3]}`);
    });

    it('Rejected', async function () {
      await this.driver.get(`https://${CUSTOMLIST[0]}`);

      await performPermissionRequest.call(this);
      await checkOrigin.call(this, CUSTOMLIST[0]);
      await checkAccountName.call(this, 'rich');
      await checkNetworkName.call(this, 'Testnet');
      await rejectMessage.call(this);
      await closeMessage.call(this);

      const [status, result] = await getPermissionRequestResult.call(this);

      expect(status).to.equal('REJECTED');

      expect(result).to.deep.equal({
        message: 'User denied message',
        data: 'rejected',
        code: '10',
      });
    });

    it('Reject forever', async function () {
      await this.driver.get(`https://${CUSTOMLIST[1]}`);

      await performPermissionRequest.call(this);

      await this.driver
        .wait(
          until.elementLocated(
            By.css('[class^="dropdownButton-dropdownButton"]')
          ),
          this.wait
        )
        .click();

      await this.driver
        .wait(until.elementLocated(By.css('#rejectForever')), this.wait)
        .click();

      await this.driver.wait(
        until.elementLocated(By.css('.tx-reject-icon')),
        this.wait
      );

      await closeMessage.call(this);

      const [status, result] = await getPermissionRequestResult.call(this);

      expect(status).to.equal('REJECTED');

      expect(result).to.deep.equal({
        message: 'User denied message',
        data: 'rejected_forever',
        code: '10',
      });
    });

    it('Approved', async function () {
      await this.driver.get(`https://${CUSTOMLIST[0]}`);

      await performPermissionRequest.call(this);
      await approveMessage.call(this);
      await closeMessage.call(this);

      const [status, result] = await getPermissionRequestResult.call(this);

      expect(status).to.equal('RESOLVED');
      expect(result.initialized).to.equal(true);
      expect(typeof result.version).to.equal('string');
      expect(result.messages).to.have.length(1);
      expect(typeof result.messages[0].id).to.equal('string');
      expect(result.messages[0].status).to.equal('signed');

      expect(result.account).to.deep.contain({
        address: '3MsX9C2MzzxE4ySF5aYcJoaiPfkyxZMg4cW',
        name: 'rich',
        network: 'testnet',
        networkCode: 'T',
        publicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
        type: 'seed',
      });

      expect(result.network).to.deep.contain({
        code: 'T',
        server: 'https://nodes-testnet.wavesnodes.com/',
        matcher: 'https://matcher-testnet.waves.exchange/',
      });

      expect(result.txVersion).to.deep.contain({
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
        '1002': [3, 2, 1],
        '1003': [1, 0],
      });
    });
  });

  describe('Authentication request from origin', function () {
    async function performAuthRequest(this: mocha.Context) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(() => {
        KeeperWallet.initialPromise
          .then(api => api.auth({ data: 'generated auth data' }))
          .then(
            result => {
              window.result = JSON.stringify(['RESOLVED', result]);
            },
            err => {
              window.result = JSON.stringify(['REJECTED', err]);
            }
          );
      });
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();
    }

    async function getAuthRequestResult(this: mocha.Context) {
      return JSON.parse(
        await this.driver.executeScript<string>(() => {
          const { result } = window;
          delete window.result;
          return result;
        })
      );
    }

    it('Rejected', async function () {
      await performAuthRequest.call(this);
      await checkOrigin.call(this, WHITELIST[3]);
      await checkAccountName.call(this, 'rich');
      await checkNetworkName.call(this, 'Testnet');
      await rejectMessage.call(this);
      await closeMessage.call(this);

      const [status, result] = await getAuthRequestResult.call(this);

      expect(status).to.equal('REJECTED');

      expect(result).to.deep.equal({
        code: '10',
        data: 'rejected',
        message: 'User denied message',
      });
    });

    it('Approved', async function () {
      await performAuthRequest.call(this);
      await approveMessage.call(this);
      await closeMessage.call(this);

      const [status, result] = await getAuthRequestResult.call(this);

      expect(status).to.equal('RESOLVED');

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

      expect(result).to.deep.contain(expectedApproveResult);

      expect(verifySignature(senderPublicKey, bytes, result.signature)).to.be
        .true;
    });
  });

  describe('Matcher request', function () {
    const timestamp = Date.now();

    async function performMatcherRequest(this: mocha.Context) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(
        (senderPublicKey: string, timestamp: number) => {
          KeeperWallet.initialPromise
            .then(api =>
              api.signRequest({
                type: 1001,
                data: {
                  senderPublicKey,
                  timestamp,
                },
              })
            )
            .then(
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
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();
    }

    async function getMatcherRequestResult(this: mocha.Context) {
      return JSON.parse(
        await this.driver.executeScript<string>(() => {
          const { result } = window;
          delete window.result;
          return result;
        })
      );
    }

    it('Rejected', async function () {
      await performMatcherRequest.call(this);
      await checkOrigin.call(this, WHITELIST[3]);
      await checkAccountName.call(this, 'rich');
      await checkNetworkName.call(this, 'Testnet');
      await rejectMessage.call(this);
      await closeMessage.call(this);

      const [status, result] = await getMatcherRequestResult.call(this);

      expect(status).to.equal('REJECTED');

      expect(result).to.deep.equal({
        code: '10',
        data: 'rejected',
        message: 'User denied message',
      });
    });

    it('Approved', async function () {
      await performMatcherRequest.call(this);
      await approveMessage.call(this);
      await closeMessage.call(this);

      const [status, result] = await getMatcherRequestResult.call(this);

      expect(status).to.equal('RESOLVED');

      const bytes = concat(
        serializePrimitives.BASE58_STRING(senderPublicKey),
        serializePrimitives.LONG(timestamp)
      );

      expect(verifySignature(senderPublicKey, bytes, result)).to.be.true;
    });
  });

  describe('Transactions', function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function performSignTransaction(this: mocha.Context, tx: any) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.driver.executeScript((tx: any) => {
        KeeperWallet.initialPromise
          .then(api => api.signTransaction(tx))
          .then(
            result => {
              window.result = JSON.stringify(['RESOLVED', result]);
            },
            err => {
              window.result = JSON.stringify(['REJECTED', err]);
            }
          );
      }, tx);
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();
    }

    async function getSignTransactionResult(this: mocha.Context) {
      return JSON.parse(
        await this.driver.executeScript<string>(() => {
          const { result } = window;
          delete window.result;
          return result;
        })
      );
    }

    function setTxVersion(
      tx: WavesKeeper.TSignTransactionData,
      version: number
    ) {
      return { ...tx, data: { ...tx.data, version } };
    }

    async function checkTxFee(this: mocha.Context, fee: string) {
      expect(
        await this.driver.findElement(By.css('[data-testid="txFee"]')).getText()
      ).to.equal(fee);
    }

    describe('Issue', function () {
      async function checkIssueType(this: mocha.Context, type: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="issueType"]'))
            .getText()
        ).to.equal(type);
      }

      async function checkIssueAmount(this: mocha.Context, amount: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="issueAmount"]'))
            .getText()
        ).to.equal(amount);
      }

      async function checkIssueDescription(
        this: mocha.Context,
        description: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="issueDescription"]'))
            .getText()
        ).to.equal(description);
      }

      async function checkIssueDecimals(this: mocha.Context, decimals: number) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="issueDecimals"]'))
            .getText()
        ).to.equal(String(decimals));
      }

      async function checkIssueReissuable(
        this: mocha.Context,
        reissuableText: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="issueReissuable"]'))
            .getText()
        ).to.equal(reissuableText);
      }

      async function checkIssueScript(this: mocha.Context, script: string) {
        expect(
          await this.driver
            .findElement(By.css('[class^="script-codeScript"]'))
            .getText()
        ).to.equal(script);
      }

      before(async function () {
        await App.restartServiceWorker.call(this);
      });

      it('Rejected', async function () {
        await performSignTransaction.call(this, ISSUE);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkIssueType.call(this, 'Issue Smart Token');
        await checkIssueAmount.call(this, '92233720368.54775807 ShortToken');
        await checkIssueDescription.call(this, ISSUE.data.description);
        await checkIssueDecimals.call(this, ISSUE.data.precision);
        await checkIssueReissuable.call(this, 'Reissuable');
        await checkIssueScript.call(this, 'base64:BQbtKNoM');

        await checkTxFee.call(this, '1.004 WAVES');

        await rejectMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('REJECTED');

        expect(approveResult).to.deep.equal({
          code: '10',
          data: 'rejected',
          message: 'User denied message',
        });
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, ISSUE);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      it('Copying script to the clipboard');

      describe('without script', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, ISSUE_WITHOUT_SCRIPT);
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await checkIssueType.call(this, 'Issue Token');
          await checkIssueAmount.call(this, '92233720368.54775807 ShortToken');
          await checkIssueDescription.call(this, ISSUE.data.description);
          await checkIssueDecimals.call(this, ISSUE.data.precision);
          await checkIssueReissuable.call(this, 'Reissuable');

          await checkTxFee.call(this, '1.004 WAVES');

          await rejectMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('REJECTED');

          expect(approveResult).to.deep.equal({
            code: '10',
            data: 'rejected',
            message: 'User denied message',
          });
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, ISSUE_WITHOUT_SCRIPT);
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.script).to.not.exist;
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, setTxVersion(ISSUE, 2));
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await checkIssueType.call(this, 'Issue Smart Token');
          await checkIssueAmount.call(this, '92233720368.54775807 ShortToken');
          await checkIssueDescription.call(this, ISSUE.data.description);
          await checkIssueDecimals.call(this, ISSUE.data.precision);
          await checkIssueReissuable.call(this, 'Reissuable');
          await checkIssueScript.call(this, 'base64:BQbtKNoM');

          await checkTxFee.call(this, '1.004 WAVES');

          await rejectMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('REJECTED');

          expect(approveResult).to.deep.equal({
            code: '10',
            data: 'rejected',
            message: 'User denied message',
          });
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, setTxVersion(ISSUE, 2));
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('Transfer', function () {
      async function checkTransferAmount(this: mocha.Context, amount: string) {
        expect(
          await this.driver
            .wait(
              until.elementLocated(By.css('[data-testid="transferAmount"]')),
              this.wait
            )
            .getText()
        ).to.equal(amount);
      }

      async function checkRecipient(this: mocha.Context, recipient: string) {
        expect(
          await this.driver
            .wait(
              until.elementLocated(By.css('[data-testid="recipient"]')),
              this.wait
            )
            .getText()
        ).to.equal(recipient);
      }

      async function checkAttachment(this: mocha.Context, attachment: string) {
        expect(
          await this.driver
            .wait(
              until.elementLocated(By.css('[data-testid="attachmentContent"]')),
              this.wait
            )
            .getText()
        ).to.equal(attachment);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, TRANSFER);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkTransferAmount.call(this, '-123456790 NonScriptToken');
        await checkRecipient.call(this, '3N5HNJz5otiU...BVv5HhYLdhiD');
        await checkAttachment.call(this, 'base64:BQbtKNoM');

        await checkTxFee.call(this, '0.005 WAVES');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, TRANSFER);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      // TODO this checks should be into unittests
      it('Address');
      it('Alias');
      it('Waves / asset / smart asset');
      it('Attachment');
      it('Transfers to Gateways');

      describe('without attachment', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, TRANSFER_WITHOUT_ATTACHMENT);
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await checkTransferAmount.call(this, '-123456790 NonScriptToken');
          await checkRecipient.call(this, 'alias:T:alice');

          await checkTxFee.call(this, '0.005 WAVES');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, TRANSFER_WITHOUT_ATTACHMENT);
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, setTxVersion(TRANSFER, 2));
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await checkTransferAmount.call(this, '-123456790 NonScriptToken');
          await checkRecipient.call(this, '3N5HNJz5otiU...BVv5HhYLdhiD');
          await checkAttachment.call(this, 'base64:BQbtKNoM');

          await checkTxFee.call(this, '0.005 WAVES');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, setTxVersion(TRANSFER, 2));
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('Reissue', function () {
      async function checkReissueAmount(this: mocha.Context, amount: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="reissueAmount"]'))
            .getText()
        ).to.equal(amount);
      }

      async function checkReissueReissuable(
        this: mocha.Context,
        reissuableText: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="reissueReissuable"]'))
            .getText()
        ).to.equal(reissuableText);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, REISSUE);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkReissueAmount.call(this, '+123456790 NonScriptToken');
        await checkReissueReissuable.call(this, 'Reissuable');

        await checkTxFee.call(this, '0.005 WAVES');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, REISSUE);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      describe('with money-like', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, REISSUE_WITH_MONEY_LIKE);
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await checkReissueAmount.call(this, '+123456790 NonScriptToken');
          await checkReissueReissuable.call(this, 'Reissuable');

          await checkTxFee.call(this, '0.005 WAVES');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, REISSUE_WITH_MONEY_LIKE);
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, setTxVersion(REISSUE, 2));
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await checkReissueAmount.call(this, '+123456790 NonScriptToken');
          await checkReissueReissuable.call(this, 'Reissuable');

          await checkTxFee.call(this, '0.005 WAVES');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, setTxVersion(REISSUE, 2));
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('Burn', function () {
      async function checkBurnAmount(this: mocha.Context, amount: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="burnAmount"]'))
            .getText()
        ).to.equal(amount);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, BURN);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkBurnAmount.call(this, '-123456790 NonScriptToken');

        await checkTxFee.call(this, '0.005 WAVES');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, BURN);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      describe('with quantity instead of amount', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, BURN_WITH_QUANTITY);
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await checkBurnAmount.call(this, '-123456790 NonScriptToken');

          await checkTxFee.call(this, '0.005 WAVES');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, BURN_WITH_QUANTITY);
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, setTxVersion(BURN, 2));
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await checkBurnAmount.call(this, '-123456790 NonScriptToken');

          await checkTxFee.call(this, '0.005 WAVES');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, setTxVersion(BURN, 2));
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('Lease', function () {
      before(async function () {
        await App.restartServiceWorker.call(this);
      });

      it('Rejected', async function () {
        await performSignTransaction.call(this, LEASE);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, LEASE);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      describe('with alias', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, LEASE_WITH_ALIAS);
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, LEASE_WITH_ALIAS);
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with money-like', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, LEASE_WITH_MONEY_LIKE);
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, LEASE_WITH_MONEY_LIKE);
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, setTxVersion(LEASE, 2));
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, setTxVersion(LEASE, 2));
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('Cancel lease', function () {
      it('Rejected', async function () {
        await performSignTransaction.call(this, CANCEL_LEASE);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, CANCEL_LEASE);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(
            this,
            setTxVersion(CANCEL_LEASE, 2)
          );
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(
            this,
            setTxVersion(CANCEL_LEASE, 2)
          );
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('Alias', function () {
      it('Rejected', async function () {
        await performSignTransaction.call(this, ALIAS);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, ALIAS);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      // TODO this checks should be into unittests
      it('Minimum alias length');
      it('Maximum alias length');

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, setTxVersion(ALIAS, 2));
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, setTxVersion(ALIAS, 2));
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);

          expect(parsedApproveResult.id).to.equal(
            base58Encode(blake2b([bytes[0], ...bytes.slice(36, -16)]))
          );

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('MassTransfer', function () {
      it('Rejected', async function () {
        await performSignTransaction.call(this, MASS_TRANSFER);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, MASS_TRANSFER);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      describe('without attachment', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(
            this,
            MASS_TRANSFER_WITHOUT_ATTACHMENT
          );

          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(
            this,
            MASS_TRANSFER_WITHOUT_ATTACHMENT
          );

          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(
            this,
            setTxVersion(MASS_TRANSFER, 1)
          );
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(
            this,
            setTxVersion(MASS_TRANSFER, 1)
          );
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('Data', function () {
      it('Rejected', async function () {
        await performSignTransaction.call(this, DATA);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, DATA);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, setTxVersion(DATA, 1));
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, setTxVersion(DATA, 1));
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('SetScript', function () {
      before(async function () {
        await App.restartServiceWorker.call(this);
      });

      it('Rejected', async function () {
        await performSignTransaction.call(this, SET_SCRIPT);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, SET_SCRIPT);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      it('Copying script to the clipboard');
      it('Set');
      it('Cancel');

      describe('without script', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, SET_SCRIPT_WITHOUT_SCRIPT);
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, SET_SCRIPT_WITHOUT_SCRIPT);
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.script).to.not.exist;
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, setTxVersion(SET_SCRIPT, 1));
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, setTxVersion(SET_SCRIPT, 1));
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('Sponsorship', function () {
      it('Rejected', async function () {
        await performSignTransaction.call(this, SPONSORSHIP);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, SPONSORSHIP);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      describe('removal', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, SPONSORSHIP_REMOVAL);
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, SPONSORSHIP_REMOVAL);
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: SPONSORSHIP_REMOVAL.type,
            version: 2,
            senderPublicKey,
            minSponsoredAssetFee:
              SPONSORSHIP_REMOVAL.data.minSponsoredAssetFee.amount,
            assetId: SPONSORSHIP_REMOVAL.data.minSponsoredAssetFee.assetId,
            fee: 500000,
            chainId: 84,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(this, setTxVersion(SPONSORSHIP, 1));
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, setTxVersion(SPONSORSHIP, 1));
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('SetAssetScript', function () {
      it('Rejected', async function () {
        await performSignTransaction.call(this, SET_ASSET_SCRIPT);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, SET_ASSET_SCRIPT);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      it('Copying script to the clipboard');

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(
            this,
            setTxVersion(SET_ASSET_SCRIPT, 1)
          );
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(
            this,
            setTxVersion(SET_ASSET_SCRIPT, 1)
          );

          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('InvokeScript', function () {
      it('Rejected', async function () {
        await performSignTransaction.call(this, INVOKE_SCRIPT);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, INVOKE_SCRIPT);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
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
          await performSignTransaction.call(this, INVOKE_SCRIPT_WITHOUT_CALL);
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(this, INVOKE_SCRIPT_WITHOUT_CALL);
          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });

      describe('with legacy serialization', function () {
        it('Rejected', async function () {
          await performSignTransaction.call(
            this,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setTxVersion(INVOKE_SCRIPT as any, 1)
          );
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignTransaction.call(
            this,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setTxVersion(INVOKE_SCRIPT as any, 1)
          );

          await approveMessage.call(this);
          await closeMessage.call(this);

          const [status, approveResult] = await getSignTransactionResult.call(
            this
          );

          expect(status).to.equal('RESOLVED');

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

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('UpdateAssetInfo', function () {
      it('Rejected', async function () {
        await performSignTransaction.call(this, UPDATE_ASSET_INFO);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignTransaction.call(this, UPDATE_ASSET_INFO);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const [status, approveResult] = await getSignTransactionResult.call(
          this
        );

        expect(status).to.equal('RESOLVED');

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          type: UPDATE_ASSET_INFO.type,
          version: 1 as const,
          senderPublicKey,
          name: UPDATE_ASSET_INFO.data.name,
          description: UPDATE_ASSET_INFO.data.description,
          assetId: UPDATE_ASSET_INFO.data.assetId,
          fee: 100000,
          feeAssetId: null,
          chainId: 84,
        };

        const bytes = makeTxBytes({
          ...expectedApproveResult,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });
    });
  });

  describe('Order', function () {
    before(async function () {
      await App.restartServiceWorker.call(this);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createOrder = (tx: any) => {
      KeeperWallet.initialPromise
        .then(api => api.signOrder(tx))
        .then(
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
      KeeperWallet.initialPromise
        .then(api => api.signCancelOrder(tx))
        .then(
          result => {
            window.result = result;
          },
          () => {
            window.result = null;
          }
        );
    };

    async function performSignOrder(
      this: mocha.Context,
      script: (tx: WavesKeeper.TSignTransactionData) => void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tx: any
    ) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(script, tx);
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();
    }

    describe('Create', function () {
      it('Rejected', async function () {
        await performSignOrder.call(this, createOrder, CREATE_ORDER);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this, 60 * 1000);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignOrder.call(this, createOrder, CREATE_ORDER);
        await approveMessage.call(this, 60 * 1000);
        await closeMessage.call(this);

        const approveResult = await this.driver.executeScript(
          () => window.result
        );

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          orderType: CREATE_ORDER.data.orderType,
          version: 3,
          assetPair: {
            amountAsset: CREATE_ORDER.data.amount.assetId,
            priceAsset: CREATE_ORDER.data.price.assetId,
          },
          price: 0,
          amount: 10000000000,
          matcherFee: 3000000,
          matcherPublicKey: CREATE_ORDER.data.matcherPublicKey,
          senderPublicKey,
          matcherFeeAssetId: null,
        };

        const bytes = binary.serializeOrder({
          ...expectedApproveResult,
          expiration: parsedApproveResult.expiration,
          timestamp: parsedApproveResult.timestamp,
        });

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
        expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.proofs[0])
        ).to.be.true;
      });

      describe('with price precision conversion', function () {
        it('Rejected', async function () {
          await performSignOrder.call(
            this,
            createOrder,
            CREATE_ORDER_WITH_PRICE_PRECISION_CONVERSION
          );
          await checkOrigin.call(this, WHITELIST[3]);
          await checkAccountName.call(this, 'rich');
          await checkNetworkName.call(this, 'Testnet');

          await rejectMessage.call(this, 60 * 1000);
          await closeMessage.call(this);
        });

        it('Approved', async function () {
          await performSignOrder.call(
            this,
            createOrder,
            CREATE_ORDER_WITH_PRICE_PRECISION_CONVERSION
          );

          await approveMessage.call(this, 60 * 1000);
          await closeMessage.call(this);

          const approveResult = await this.driver.executeScript(
            () => window.result
          );

          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            orderType:
              CREATE_ORDER_WITH_PRICE_PRECISION_CONVERSION.data.orderType,
            version: 3,
            assetPair: {
              amountAsset:
                CREATE_ORDER_WITH_PRICE_PRECISION_CONVERSION.data.amount
                  .assetId,
              priceAsset:
                CREATE_ORDER_WITH_PRICE_PRECISION_CONVERSION.data.price.assetId,
            },
            price: 101400200,
            amount: 1000000,
            matcherFee: 4077612,
            matcherPublicKey:
              CREATE_ORDER_WITH_PRICE_PRECISION_CONVERSION.data
                .matcherPublicKey,
            senderPublicKey,
            matcherFeeAssetId: 'EMAMLxDnv3xiz8RXg8Btj33jcEw3wLczL3JKYYmuubpc',
          };

          const bytes = binary.serializeOrder({
            ...expectedApproveResult,
            expiration: parsedApproveResult.expiration,
            timestamp: parsedApproveResult.timestamp,
          });

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
          expect(parsedApproveResult.id).to.equal(base58Encode(blake2b(bytes)));

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        });
      });
    });

    describe('Cancel', function () {
      it('Rejected', async function () {
        await performSignOrder.call(this, cancelOrder, CANCEL_ORDER);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignOrder.call(this, cancelOrder, CANCEL_ORDER);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const approveResult = await this.driver.executeScript(
          () => window.result
        );

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          orderId: CANCEL_ORDER.data.id,
          sender: senderPublicKey,
        };

        const bytes = cancelOrderParamsToBytes(expectedApproveResult);

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.signature)
        ).to.be.true;
      });
    });
  });

  describe('Multiple transactions package', function () {
    async function performSignTransactionPackage(
      this: mocha.Context,
      tx: WavesKeeper.TSignTransactionData[],
      name: string
    ) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(
        (tx: WavesKeeper.TSignTransactionData[], name: string) => {
          KeeperWallet.initialPromise
            .then(api => api.signTransactionPackage(tx, name))
            .then(
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
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();
    }

    it('Rejected', async function () {
      await performSignTransactionPackage.call(
        this,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PACKAGE as any,
        'Test package'
      );
      await checkOrigin.call(this, WHITELIST[3]);
      await checkAccountName.call(this, 'rich');
      await checkNetworkName.call(this, 'Testnet');

      await rejectMessage.call(this);
      await closeMessage.call(this);
    });

    it('Approved', async function () {
      await performSignTransactionPackage.call(
        this,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PACKAGE as any,
        'Test package'
      );

      await approveMessage.call(this);
      await closeMessage.call(this);

      const approveResult = await this.driver.executeScript<string[]>(
        () => window.result
      );

      expect(approveResult).to.have.length(7);

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

      expect(parsedApproveResult[0]).to.deep.contain(expectedApproveResult0);
      expect(parsedApproveResult[0].id).to.equal(base58Encode(blake2b(bytes0)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes0,
          parsedApproveResult[0].proofs[0]
        )
      ).to.be.true;

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

      expect(parsedApproveResult[1]).to.deep.contain(expectedApproveResult1);
      expect(parsedApproveResult[1].id).to.equal(base58Encode(blake2b(bytes1)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes1,
          parsedApproveResult[1].proofs[0]
        )
      ).to.be.true;

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

      expect(parsedApproveResult[2]).to.deep.contain(expectedApproveResult2);
      expect(parsedApproveResult[2].id).to.equal(base58Encode(blake2b(bytes2)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes2,
          parsedApproveResult[2].proofs[0]
        )
      ).to.be.true;

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

      expect(parsedApproveResult[3]).to.deep.contain(expectedApproveResult3);
      expect(parsedApproveResult[3].id).to.equal(base58Encode(blake2b(bytes3)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes3,
          parsedApproveResult[3].proofs[0]
        )
      ).to.be.true;

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

      expect(parsedApproveResult[4]).to.deep.contain(expectedApproveResult4);
      expect(parsedApproveResult[4].id).to.equal(base58Encode(blake2b(bytes4)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes4,
          parsedApproveResult[4].proofs[0]
        )
      ).to.be.true;

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

      expect(parsedApproveResult[5]).to.deep.contain(expectedApproveResult5);
      expect(parsedApproveResult[5].id).to.equal(base58Encode(blake2b(bytes5)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes5,
          parsedApproveResult[5].proofs[0]
        )
      ).to.be.true;

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

      expect(parsedApproveResult[6]).to.deep.contain(expectedApproveResult6);
      expect(parsedApproveResult[6].id).to.equal(base58Encode(blake2b(bytes6)));

      expect(
        verifySignature(
          senderPublicKey,
          bytes6,
          parsedApproveResult[6].proofs[0]
        )
      ).to.be.true;
    });
  });

  describe('Custom data', function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function performSignCustomData(this: mocha.Context, data: any) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.driver.executeScript((data: any) => {
        KeeperWallet.initialPromise
          .then(api => api.signCustomData(data))
          .then(
            result => {
              window.result = JSON.stringify(result);
            },
            () => {
              window.result = null;
            }
          );
      }, data);
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();
    }

    describe('Version 1', function () {
      it('Rejected', async function () {
        await performSignCustomData.call(this, CUSTOM_DATA_V1);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignCustomData.call(this, CUSTOM_DATA_V1);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const approveResult = await this.driver.executeScript<string>(
          () => window.result
        );

        const parsedApproveResult = JSON.parse(approveResult);

        const expectedApproveResult = {
          binary: CUSTOM_DATA_V1.binary,
          version: CUSTOM_DATA_V1.version,
          publicKey: senderPublicKey,
          hash: 'BddvukE8EsQ22TC916wr9hxL5MTinpcxj7cKmyQFu1Qj',
        };

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);

        expect(
          verifySignature(
            senderPublicKey,
            serializeCustomData(expectedApproveResult),
            parsedApproveResult.signature
          )
        ).to.be.true;
      });
    });

    describe('Version 2', function () {
      it('Rejected', async function () {
        await performSignCustomData.call(this, CUSTOM_DATA_V2);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignCustomData.call(this, CUSTOM_DATA_V2);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const approveResult = await this.driver.executeScript<string>(
          () => window.result
        );

        const parsedApproveResult = JSON.parse(approveResult);

        const expectedApproveResult = {
          data: CUSTOM_DATA_V2.data,
          version: CUSTOM_DATA_V2.version,
          publicKey: senderPublicKey,
          hash: 'CntDRDubtuhwBKsmCTtZzMLVF9TFK6hLoWP424V8Zz2K',
        };

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);

        expect(
          verifySignature(
            senderPublicKey,
            serializeCustomData(expectedApproveResult),
            parsedApproveResult.signature
          )
        ).to.be.true;
      });
    });
  });
});
