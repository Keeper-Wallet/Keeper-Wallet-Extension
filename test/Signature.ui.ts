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
import { expect } from 'chai';
import * as mocha from 'mocha';
import create from 'parse-json-bignumber';
import { By, until } from 'selenium-webdriver';

import {
  App,
  CreateNewAccount,
  Network,
  Settings,
  Windows,
} from './utils/actions';
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
      until.elementLocated(By.css('[class^="originAddress@transactions"]')),
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
      until.elementLocated(By.css('[class^="accountName@wallet"]')),
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
      until.elementLocated(By.css('[class^="originNetwork@transactions"]')),
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

  describe('Stale messages removal', function () {
    it('removes messages and closes window when tab is reloaded', async function () {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(() => {
        KeeperWallet.auth({ data: 'hello' });
      });
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();

      await checkOrigin.call(this, WHITELIST[3]);
      await checkAccountName.call(this, 'rich');
      await checkNetworkName.call(this, 'Testnet');

      await this.driver.switchTo().window(tabOrigin);
      await this.driver.navigate().refresh();

      await Windows.waitForWindowToClose.call(this, messageWindow);

      await this.driver.switchTo().newWindow('tab');
      await App.open.call(this);

      await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, 'assets@assets')]")
        ),
        this.wait
      );

      await this.driver.close();
      await this.driver.switchTo().window(tabOrigin);
    });

    it('removes messages and closes window when the tab is closed', async function () {
      await this.driver.switchTo().newWindow('tab');
      const newTabOrigin = await this.driver.getWindowHandle();
      await this.driver.get(`https://${CUSTOMLIST[1]}`);

      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(() => {
        KeeperWallet.auth({ data: 'hello' });
      });
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();

      await checkOrigin.call(this, CUSTOMLIST[1]);
      await checkAccountName.call(this, 'rich');
      await checkNetworkName.call(this, 'Testnet');

      await this.driver.switchTo().window(newTabOrigin);
      await this.driver.close();
      await this.driver.switchTo().window(tabOrigin);

      await Windows.waitForWindowToClose.call(this, messageWindow);

      await this.driver.switchTo().newWindow('tab');
      await App.open.call(this);

      await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, 'assets@assets')]")
        ),
        this.wait
      );

      await this.driver.close();
      await this.driver.switchTo().window(tabOrigin);
    });

    it('does not close message window, if there are other messages left', async function () {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(() => {
        KeeperWallet.auth({ data: 'hello' });
      });
      [messageWindow] = await waitForNewWindows(1);
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();

      await checkOrigin.call(this, WHITELIST[3]);
      await checkAccountName.call(this, 'rich');
      await checkNetworkName.call(this, 'Testnet');

      await this.driver.switchTo().newWindow('tab');
      const newTabOrigin = await this.driver.getWindowHandle();
      await this.driver.get(`https://${CUSTOMLIST[1]}`);

      await this.driver.executeScript(() => {
        KeeperWallet.auth({ data: 'hello' });
      });

      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();

      await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, 'messageList@messageList')]")
        ),
        this.wait
      );

      expect(
        await this.driver.findElements(
          By.xpath("//div[contains(@class, 'cardItem@messageList')]")
        )
      ).to.have.length(2);

      await this.driver.switchTo().window(newTabOrigin);
      await this.driver.close();

      await this.driver.switchTo().window(messageWindow);
      await checkOrigin.call(this, WHITELIST[3]);
      await checkAccountName.call(this, 'rich');
      await checkNetworkName.call(this, 'Testnet');
      await rejectMessage.call(this);
      await closeMessage.call(this);
    });
  });

  describe('Permission request from origin', function () {
    async function performPermissionRequest(this: mocha.Context) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(() => {
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
            By.css('[class^="dropdownButton@dropdownButton"]')
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
        '1002': [4, 3, 2, 1],
        '1003': [1, 0],
      });
    });
  });

  describe('Authentication request from origin', function () {
    async function performAuthRequest(this: mocha.Context) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(() => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-shadow
      await this.driver.executeScript((tx: any) => {
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
      tx: Parameters<typeof KeeperWallet['signTransaction']>[0],
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
            .findElement(By.css('[data-testid="contentScript"]'))
            .getText()
        ).to.equal(script);
      }

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
      async function checkLeaseAmount(this: mocha.Context, amount: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="leaseAmount"]'))
            .getText()
        ).to.equal(amount);
      }

      async function checkLeaseRecipient(
        this: mocha.Context,
        recipient: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="leaseRecipient"]'))
            .getText()
        ).to.equal(recipient);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, LEASE);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkLeaseAmount.call(this, '1.23456790 WAVES');
        await checkLeaseRecipient.call(this, '3N5HNJz5otiU...BVv5HhYLdhiD');

        await checkTxFee.call(this, '0.005 WAVES');

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

          await checkLeaseAmount.call(this, '1.23456790 WAVES');
          await checkLeaseRecipient.call(this, 'alias:T:bobby');

          await checkTxFee.call(this, '0.005 WAVES');

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

          await checkLeaseAmount.call(this, '1.23456790 WAVES');
          await checkLeaseRecipient.call(this, '3N5HNJz5otiU...BVv5HhYLdhiD');

          await checkTxFee.call(this, '0.005 WAVES');

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

          await checkLeaseAmount.call(this, '1.23456790 WAVES');
          await checkLeaseRecipient.call(this, '3N5HNJz5otiU...BVv5HhYLdhiD');

          await checkTxFee.call(this, '0.005 WAVES');

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
      async function checkCancelLeaseAmount(
        this: mocha.Context,
        amount: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="cancelLeaseAmount"]'))
            .getText()
        ).to.equal(amount);
      }

      async function checkCancelLeaseRecipient(
        this: mocha.Context,
        recipient: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="cancelLeaseRecipient"]'))
            .getText()
        ).to.equal(recipient);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, CANCEL_LEASE);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkCancelLeaseAmount.call(this, '0.00000001 WAVES');
        await checkCancelLeaseRecipient.call(this, 'alias:T:merry');

        await checkTxFee.call(this, '0.005 WAVES');

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

          await checkCancelLeaseAmount.call(this, '0.00000001 WAVES');
          await checkCancelLeaseRecipient.call(this, 'alias:T:merry');

          await checkTxFee.call(this, '0.005 WAVES');

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
      async function checkAliasValue(this: mocha.Context, value: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="aliasValue"]'))
            .getText()
        ).to.equal(value);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, ALIAS);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkAliasValue.call(this, 'test_alias');

        await checkTxFee.call(this, '0.005 WAVES');

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

          await checkAliasValue.call(this, 'test_alias');

          await checkTxFee.call(this, '0.005 WAVES');

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
      async function checkMassTransferAmount(
        this: mocha.Context,
        amount: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="massTransferAmount"]'))
            .getText()
        ).to.equal(amount);
      }

      async function checkMassTransferItems(
        this: mocha.Context,
        items: Array<{ recipient: string; amount: string }>
      ) {
        const itemElements = await this.driver.findElements(
          By.css('[data-testid="massTransferItem"]')
        );

        const actualItems = await Promise.all(
          itemElements.map(async itemEl => {
            const [recipient, amount] = await Promise.all([
              itemEl
                .findElement(
                  By.css('[data-testid="massTransferItemRecipient"]')
                )
                .getText(),
              itemEl
                .findElement(By.css('[data-testid="massTransferItemAmount"]'))
                .getText(),
            ]);

            return {
              recipient,
              amount,
            };
          })
        );

        expect(actualItems).to.deep.equal(items);
      }

      async function checkMassTransferAttachment(
        this: mocha.Context,
        attachment: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="massTransferAttachment"]'))
            .getText()
        ).to.equal(attachment);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, MASS_TRANSFER);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkMassTransferAmount.call(this, '-2 NonScriptToken');

        await checkMassTransferItems.call(this, [
          {
            recipient: '3N5HNJz5otiU...BVv5HhYLdhiD',
            amount: '1',
          },
          {
            recipient: 'alias:T:merry',
            amount: '1',
          },
        ]);

        await checkMassTransferAttachment.call(this, 'base64:BQbtKNoM');

        await checkTxFee.call(this, '0.006 WAVES');

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

          await checkMassTransferAmount.call(this, '-2 NonScriptToken');

          await checkMassTransferItems.call(this, [
            {
              recipient: '3N5HNJz5otiU...BVv5HhYLdhiD',
              amount: '1',
            },
            {
              recipient: 'alias:T:merry',
              amount: '1',
            },
          ]);

          await checkTxFee.call(this, '0.006 WAVES');

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

          await checkMassTransferAmount.call(this, '-2 NonScriptToken');

          await checkMassTransferItems.call(this, [
            {
              recipient: '3N5HNJz5otiU...BVv5HhYLdhiD',
              amount: '1',
            },
            {
              recipient: 'alias:T:merry',
              amount: '1',
            },
          ]);

          await checkMassTransferAttachment.call(this, 'base64:BQbtKNoM');

          await checkTxFee.call(this, '0.006 WAVES');

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
      async function checkDataEntries(
        this: mocha.Context,
        entries: Array<{ key: string; type: string; value: string }>
      ) {
        const dataRows = await this.driver.findElements(
          By.css('[data-testid="dataRow"]')
        );

        const actualItems = await Promise.all(
          dataRows.map(async entryEl => {
            const [key, type, value] = await Promise.all([
              entryEl
                .findElement(By.css('[data-testid="dataRowKey"]'))
                .getText(),
              entryEl
                .findElement(By.css('[data-testid="dataRowType"]'))
                .getText(),
              entryEl
                .findElement(By.css('[data-testid="dataRowValue"]'))
                .getText(),
            ]);

            return {
              key,
              type,
              value,
            };
          })
        );

        expect(actualItems).to.deep.equal(entries);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, DATA);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkDataEntries.call(this, [
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

        await checkTxFee.call(this, '0.005 WAVES');

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

          await checkDataEntries.call(this, [
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

          await checkTxFee.call(this, '0.005 WAVES');

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
      async function checkScript(this: mocha.Context, script: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="contentScript"]'))
            .getText()
        ).to.equal(script);
      }

      async function checkSetScriptTitle(this: mocha.Context, title: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="setScriptTitle"]'))
            .getText()
        ).to.equal(title);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, SET_SCRIPT);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkSetScriptTitle.call(this, 'Set Script');
        await checkScript.call(this, 'base64:BQbtKNoM');

        await checkTxFee.call(this, '0.005 WAVES');

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

          await checkSetScriptTitle.call(this, 'Remove Account Script');

          await checkTxFee.call(this, '0.005 WAVES');

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

          await checkSetScriptTitle.call(this, 'Set Script');
          await checkScript.call(this, 'base64:BQbtKNoM');

          await checkTxFee.call(this, '0.005 WAVES');

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
      async function checkSponsorshipTitle(this: mocha.Context, title: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="sponsorshipTitle"]'))
            .getText()
        ).to.equal(title);
      }

      async function checkSponsorshipAmount(
        this: mocha.Context,
        amount: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="sponsorshipAmount"]'))
            .getText()
        ).to.equal(amount);
      }

      async function checkSponsorshipAsset(this: mocha.Context, asset: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="sponsorshipAsset"]'))
            .getText()
        ).to.equal(asset);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, SPONSORSHIP);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkSponsorshipTitle.call(this, 'Set Sponsorship');
        await checkSponsorshipAmount.call(this, '123456790 NonScriptToken');

        await checkTxFee.call(this, '0.005 WAVES');

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

          await checkSponsorshipTitle.call(this, 'Disable Sponsorship');
          await checkSponsorshipAsset.call(this, 'NonScriptToken');

          await checkTxFee.call(this, '0.005 WAVES');

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
            minSponsoredAssetFee: null,
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

          await checkSponsorshipTitle.call(this, 'Set Sponsorship');
          await checkSponsorshipAmount.call(this, '123456790 NonScriptToken');

          await checkTxFee.call(this, '0.005 WAVES');

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
      async function checkAssetName(this: mocha.Context, asset: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="setAssetScriptAsset"]'))
            .getText()
        ).to.equal(asset);
      }

      async function checkScript(this: mocha.Context, script: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="contentScript"]'))
            .getText()
        ).to.equal(script);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, SET_ASSET_SCRIPT);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkAssetName.call(this, 'NonScriptToken');
        await checkScript.call(this, 'base64:BQbtKNoM');

        await checkTxFee.call(this, '1.004 WAVES');

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

          await checkAssetName.call(this, 'NonScriptToken');
          await checkScript.call(this, 'base64:BQbtKNoM');

          await checkTxFee.call(this, '1.004 WAVES');

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
      async function checkPaymentsTitle(this: mocha.Context, title: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="invokeScriptPaymentsTitle"]'))
            .getText()
        ).to.equal(title);
      }

      async function checkDApp(this: mocha.Context, dApp: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="invokeScriptDApp"]'))
            .getText()
        ).to.equal(dApp);
      }

      async function checkFunction(this: mocha.Context, fn: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="invokeScriptFunction"]'))
            .getText()
        ).to.equal(fn);
      }

      async function checkArgs(
        this: mocha.Context,
        args: Array<{ type: string; value: string }>
      ) {
        const argElements = await this.driver.findElements(
          By.css('[data-testid="invokeArgument"]')
        );

        const actualArgs = await Promise.all(
          argElements.map(async el => {
            const [type, value] = await Promise.all([
              el
                .findElement(By.css('[data-testid="invokeArgumentType"]'))
                .getText(),
              el
                .findElement(By.css('[data-testid="invokeArgumentValue"]'))
                .getText(),
            ]);

            return {
              type,
              value,
            };
          })
        );

        expect(actualArgs).to.deep.equal(args);
      }

      async function checkPayments(this: mocha.Context, payments: string[]) {
        const paymentElements = await this.driver.findElements(
          By.css('[data-testid="invokeScriptPaymentItem"]')
        );

        const actualPayments = await Promise.all(
          paymentElements.map(el => el.getText())
        );

        expect(actualPayments).to.deep.equal(payments);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, INVOKE_SCRIPT);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkPaymentsTitle.call(this, '2 Payments');
        await checkDApp.call(this, INVOKE_SCRIPT.data.dApp);
        await checkFunction.call(this, INVOKE_SCRIPT.data.call.function);

        await checkArgs.call(this, [
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

        await checkPayments.call(this, [
          '0.00000001 WAVES',
          '1 NonScriptToken',
        ]);

        await checkTxFee.call(this, '0.005 WAVES');

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

          await checkPaymentsTitle.call(this, 'No Payments');
          await checkDApp.call(this, INVOKE_SCRIPT_WITHOUT_CALL.data.dApp);
          await checkFunction.call(this, 'default');
          await checkArgs.call(this, []);
          await checkPayments.call(this, []);
          await checkTxFee.call(this, '0.005 WAVES');

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

          await checkPaymentsTitle.call(this, '2 Payments');
          await checkDApp.call(this, INVOKE_SCRIPT.data.dApp);
          await checkFunction.call(this, INVOKE_SCRIPT.data.call.function);

          await checkArgs.call(this, [
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

          await checkPayments.call(this, [
            '0.00000001 WAVES',
            '1 NonScriptToken',
          ]);

          await checkTxFee.call(this, '0.005 WAVES');

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
      async function checkAssetId(this: mocha.Context, assetId: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="updateAssetInfoAssetId"]'))
            .getText()
        ).to.equal(assetId);
      }

      async function checkAssetName(this: mocha.Context, assetName: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="updateAssetInfoAssetName"]'))
            .getText()
        ).to.equal(assetName);
      }

      async function checkAssetDescription(
        this: mocha.Context,
        description: string
      ) {
        expect(
          await this.driver
            .findElement(
              By.css('[data-testid="updateAssetInfoAssetDescription"]')
            )
            .getText()
        ).to.equal(description);
      }

      async function checkFee(this: mocha.Context, fee: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="updateAssetInfoFee"]'))
            .getText()
        ).to.equal(fee);
      }

      it('Rejected', async function () {
        await performSignTransaction.call(this, UPDATE_ASSET_INFO);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkAssetId.call(this, UPDATE_ASSET_INFO.data.assetId);
        await checkAssetName.call(this, UPDATE_ASSET_INFO.data.name);

        await checkAssetDescription.call(
          this,
          UPDATE_ASSET_INFO.data.description
        );

        await checkFee.call(this, '0.001 WAVES');

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
      this: mocha.Context,
      script: (
        tx: Parameters<typeof KeeperWallet['signTransaction']>[0]
      ) => void,
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
      async function checkCreateOrderTitle(this: mocha.Context, title: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="createOrderTitle"]'))
            .getText()
        ).to.equal(title);
      }

      async function checkCreateOrderTitleAmount(
        this: mocha.Context,
        amount: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="createOrderTitleAmount"]'))
            .getText()
        ).to.equal(amount);
      }

      async function checkCreateOrderTitlePrice(
        this: mocha.Context,
        price: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="createOrderTitlePrice"]'))
            .getText()
        ).to.equal(price);
      }

      async function checkCreateOrderPrice(this: mocha.Context, price: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="createOrderPrice"]'))
            .getText()
        ).to.equal(price);
      }

      async function checkCreateOrderMatcherPublicKey(
        this: mocha.Context,
        matcherPublicKey: string
      ) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="createOrderMatcherPublicKey"]'))
            .getText()
        ).to.equal(matcherPublicKey);
      }

      async function checkCreateOrderFee(this: mocha.Context, fee: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="createOrderFee"]'))
            .getText()
        ).to.equal(fee);
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
            await performSignOrder.call(this, createOrder, INPUT);
            await checkOrigin.call(this, WHITELIST[3]);
            await checkAccountName.call(this, 'rich');
            await checkNetworkName.call(this, 'Testnet');

            await checkCreateOrderTitle.call(
              this,
              'Sell: WAVES/NonScriptToken'
            );
            await checkCreateOrderTitleAmount.call(this, '-100.00000000 WAVES');
            await checkCreateOrderTitlePrice.call(this, '+0 NonScriptToken');
            await checkCreateOrderPrice.call(this, '0 NonScriptToken');
            await checkCreateOrderMatcherPublicKey.call(
              this,
              INPUT.data.matcherPublicKey
            );
            await checkCreateOrderFee.call(this, '0.03 WAVES');

            await rejectMessage.call(this, 60 * 1000);
            await closeMessage.call(this);
          });

          it('Approved', async function () {
            await performSignOrder.call(this, createOrder, INPUT);
            await approveMessage.call(this, 60 * 1000);
            await closeMessage.call(this);

            const approveResult = await this.driver.executeScript(
              () => window.result
            );

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

            expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
            expect(parsedApproveResult.id).to.equal(
              base58Encode(blake2b(bytes))
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
            await performSignOrder.call(this, createOrder, INPUT);
            await checkOrigin.call(this, WHITELIST[3]);
            await checkAccountName.call(this, 'rich');
            await checkNetworkName.call(this, 'Testnet');

            await checkCreateOrderTitle.call(
              this,
              'Buy: Tether USD/USD-Nea272c'
            );
            await checkCreateOrderTitleAmount.call(
              this,
              '+1.000000 Tether USD'
            );
            await checkCreateOrderTitlePrice.call(
              this,
              '-1.014002 USD-Nea272c'
            );
            await checkCreateOrderPrice.call(this, '1.014002 USD-Nea272c');
            await checkCreateOrderMatcherPublicKey.call(
              this,
              INPUT.data.matcherPublicKey
            );
            await checkCreateOrderFee.call(this, '0.04077612 TXW-DEVa4f6df');

            await rejectMessage.call(this, 60 * 1000);
            await closeMessage.call(this);
          });

          it('Approved', async function () {
            await performSignOrder.call(this, createOrder, INPUT);

            await approveMessage.call(this, 60 * 1000);
            await closeMessage.call(this);

            const approveResult = await this.driver.executeScript(
              () => window.result
            );

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

            expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
            expect(parsedApproveResult.id).to.equal(
              base58Encode(blake2b(bytes))
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
            await performSignOrder.call(this, createOrder, INPUT);
            await checkOrigin.call(this, WHITELIST[3]);
            await checkAccountName.call(this, 'rich');
            await checkNetworkName.call(this, 'Testnet');

            await checkCreateOrderTitle.call(
              this,
              'Buy: Tether USD/USD-Nea272c'
            );
            await checkCreateOrderTitleAmount.call(
              this,
              '+1.000000 Tether USD'
            );
            await checkCreateOrderTitlePrice.call(
              this,
              '-1.014002 USD-Nea272c'
            );
            await checkCreateOrderPrice.call(this, '1.014002 USD-Nea272c');
            await checkCreateOrderMatcherPublicKey.call(
              this,
              INPUT.data.matcherPublicKey
            );
            await checkCreateOrderFee.call(this, '0.04077612 TXW-DEVa4f6df');

            await rejectMessage.call(this, 60 * 1000);
            await closeMessage.call(this);
          });

          it('Approved', async function () {
            await performSignOrder.call(this, createOrder, INPUT);

            await approveMessage.call(this, 60 * 1000);
            await closeMessage.call(this);

            const approveResult = await this.driver.executeScript(
              () => window.result
            );

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

            expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
            expect(parsedApproveResult.id).to.equal(
              base58Encode(blake2b(bytes))
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
            await performSignOrder.call(this, createOrder, INPUT);
            await checkOrigin.call(this, WHITELIST[3]);
            await checkAccountName.call(this, 'rich');
            await checkNetworkName.call(this, 'Testnet');

            await checkCreateOrderTitle.call(
              this,
              'Buy: Tether USD/USD-Nea272c'
            );
            await checkCreateOrderTitleAmount.call(
              this,
              '+1.000000 Tether USD'
            );
            await checkCreateOrderTitlePrice.call(
              this,
              '-1.014002 USD-Nea272c'
            );
            await checkCreateOrderPrice.call(this, '1.014002 USD-Nea272c');
            await checkCreateOrderMatcherPublicKey.call(
              this,
              INPUT.data.matcherPublicKey
            );
            await checkCreateOrderFee.call(this, '0.04077612 TXW-DEVa4f6df');

            await rejectMessage.call(this, 60 * 1000);
            await closeMessage.call(this);
          });

          it('Approved', async function () {
            await performSignOrder.call(this, createOrder, INPUT);

            await approveMessage.call(this, 60 * 1000);
            await closeMessage.call(this);

            const approveResult = await this.driver.executeScript(
              () => window.result
            );

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

            expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
            expect(parsedApproveResult.id).to.equal(
              base58Encode(blake2b(bytes))
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
            await performSignOrder.call(this, createOrder, INPUT);
            await checkOrigin.call(this, WHITELIST[3]);
            await checkAccountName.call(this, 'rich');
            await checkNetworkName.call(this, 'Testnet');

            await checkCreateOrderTitle.call(
              this,
              'Buy: Tether USD/USD-Nea272c'
            );
            await checkCreateOrderTitleAmount.call(
              this,
              '+1.000000 Tether USD'
            );
            await checkCreateOrderTitlePrice.call(
              this,
              '-1.014002 USD-Nea272c'
            );
            await checkCreateOrderPrice.call(this, '1.014002 USD-Nea272c');
            await checkCreateOrderMatcherPublicKey.call(
              this,
              INPUT.data.matcherPublicKey
            );
            await checkCreateOrderFee.call(this, '0.04077612 TXW-DEVa4f6df');

            await rejectMessage.call(this, 60 * 1000);
            await closeMessage.call(this);
          });

          it('Approved', async function () {
            await performSignOrder.call(this, createOrder, INPUT);

            await approveMessage.call(this, 60 * 1000);
            await closeMessage.call(this);

            const approveResult = await this.driver.executeScript(
              () => window.result
            );

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

            expect(parsedApproveResult).to.deep.contain(expectedApproveResult);
            expect(parsedApproveResult.id).to.equal(
              base58Encode(blake2b(bytes))
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
    });

    describe('Cancel', function () {
      const INPUT = {
        type: 1003,
        data: {
          id: '31EeVpTAronk95TjCHdyaveDukde4nDr9BfFpvhZ3Sap',
        },
      };

      async function checkOrderId(this: mocha.Context, orderId: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="cancelOrderOrderId"]'))
            .getText()
        ).to.equal(orderId);
      }

      it('Rejected', async function () {
        await performSignOrder.call(this, cancelOrder, INPUT);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkOrderId.call(this, INPUT.data.id);

        await rejectMessage.call(this);
        await closeMessage.call(this);
      });

      it('Approved', async function () {
        await performSignOrder.call(this, cancelOrder, INPUT);
        await approveMessage.call(this);
        await closeMessage.call(this);

        const approveResult = await this.driver.executeScript(
          () => window.result
        );

        const parsedApproveResult = parse(approveResult);

        const expectedApproveResult = {
          orderId: INPUT.data.id,
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
      tx: Array<Parameters<typeof KeeperWallet['signTransaction']>[0]>,
      name: string
    ) {
      const { waitForNewWindows } = await Windows.captureNewWindows.call(this);
      await this.driver.executeScript(
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
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();
    }

    async function checkPackageCountTitle(this: mocha.Context, title: string) {
      expect(
        await this.driver
          .findElement(By.css('[data-testid="packageCountTitle"]'))
          .getText()
      ).to.equal(title);
    }

    async function checkPackageAmounts(this: mocha.Context, amounts: string[]) {
      const amountItems = await this.driver.findElements(
        By.css('[data-testid="packageAmountItem"]')
      );

      const actualAmounts = await Promise.all(
        amountItems.map(el => el.getText())
      );

      expect(actualAmounts).to.deep.equal(amounts);
    }

    async function checkPackageFees(this: mocha.Context, fees: string[]) {
      const feeItems = await this.driver.findElements(
        By.css('[data-testid="packageFeeItem"]')
      );

      const actualFees = await Promise.all(feeItems.map(el => el.getText()));

      expect(actualFees).to.deep.equal(fees);
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

      await checkPackageCountTitle.call(this, '7 Transactions');

      await checkPackageAmounts.call(this, [
        '+92233720368.54775807 ShortToken',
        '-123456790 NonScriptToken',
        '+123456790 NonScriptToken',
        '-123456790 NonScriptToken',
        '-1.23456790 WAVES',
        '+0.00000001 WAVES',
        '-0.00000001 WAVES',
        '-1 NonScriptToken',
      ]);

      await checkPackageFees.call(this, ['1.029 WAVES', '0.005 WAVES']);

      await this.driver
        .findElement(By.css('[data-testid="packageDetailsToggle"]'))
        .click();

      const packageElements = await this.driver.wait(
        until.elementsLocated(By.css('[data-testid="packageItem"]')),
        this.wait
      );

      expect(packageElements).to.have.length(7);

      const [issue, transfer, reissue, burn, lease, cancelLease, invokeScript] =
        packageElements;

      expect(
        await issue.findElement(By.css('[data-testid="issueType"]')).getText()
      ).to.equal('Issue Smart Token');

      expect(
        await issue.findElement(By.css('[data-testid="issueAmount"]')).getText()
      ).to.equal('92233720368.54775807 ShortToken');

      expect(
        await issue
          .findElement(By.css('[data-testid="issueDescription"]'))
          .getText()
      ).to.equal('Full description of ShortToken');

      expect(
        await issue
          .findElement(By.css('[data-testid="issueDecimals"]'))
          .getText()
      ).to.equal('8');

      expect(
        await issue
          .findElement(By.css('[data-testid="issueReissuable"]'))
          .getText()
      ).to.equal('Reissuable');

      expect(
        await issue
          .findElement(By.css('[data-testid="contentScript"]'))
          .getText()
      ).to.equal('base64:BQbtKNoM');

      expect(
        await issue.findElement(By.css('[data-testid="txFee"]')).getText()
      ).to.equal('1.004 WAVES');

      expect(
        await transfer
          .findElement(By.css('[data-testid="transferAmount"]'))
          .getText()
      ).to.equal('-123456790 NonScriptToken');

      expect(
        await transfer
          .findElement(By.css('[data-testid="recipient"]'))
          .getText()
      ).to.equal('3N5HNJz5otiU...BVv5HhYLdhiD');

      expect(
        await transfer
          .findElement(By.css('[data-testid="attachmentContent"]'))
          .getText()
      ).to.equal('base64:BQbtKNoM');

      expect(
        await transfer.findElement(By.css('[data-testid="txFee"]')).getText()
      ).to.equal('0.005 WAVES');

      expect(
        await reissue
          .findElement(By.css('[data-testid="reissueAmount"]'))
          .getText()
      ).to.equal('+123456790 NonScriptToken');

      expect(
        await reissue.findElement(By.css('[data-testid="txFee"]')).getText()
      ).to.equal('0.005 WAVES');

      expect(
        await burn.findElement(By.css('[data-testid="burnAmount"]')).getText()
      ).to.equal('-123456790 NonScriptToken');

      expect(
        await burn.findElement(By.css('[data-testid="txFee"]')).getText()
      ).to.equal('0.005 WAVES');

      expect(
        await lease.findElement(By.css('[data-testid="leaseAmount"]')).getText()
      ).to.equal('1.23456790 WAVES');

      expect(
        await lease
          .findElement(By.css('[data-testid="leaseRecipient"]'))
          .getText()
      ).to.equal('3N5HNJz5otiU...BVv5HhYLdhiD');

      expect(
        await lease.findElement(By.css('[data-testid="txFee"]')).getText()
      ).to.equal('0.005 WAVES');

      expect(
        await cancelLease
          .findElement(By.css('[data-testid="cancelLeaseAmount"]'))
          .getText()
      ).to.equal('0.00000001 WAVES');

      expect(
        await cancelLease
          .findElement(By.css('[data-testid="cancelLeaseRecipient"]'))
          .getText()
      ).to.equal('alias:T:merry');

      expect(
        await cancelLease.findElement(By.css('[data-testid="txFee"]')).getText()
      ).to.equal('0.005 WAVES');

      expect(
        await invokeScript
          .findElement(By.css('[data-testid="invokeScriptPaymentsTitle"]'))
          .getText()
      ).to.equal('2 Payments');

      expect(
        await invokeScript
          .findElement(By.css('[data-testid="invokeScriptDApp"]'))
          .getText()
      ).to.equal(INVOKE_SCRIPT.data.dApp);

      expect(
        await invokeScript
          .findElement(By.css('[data-testid="invokeScriptFunction"]'))
          .getText()
      ).to.equal(INVOKE_SCRIPT.data.call.function);

      const argElements = await invokeScript.findElements(
        By.css('[data-testid="invokeArgument"]')
      );

      const actualArgs = await Promise.all(
        argElements.map(async el => {
          const [type, value] = await Promise.all([
            el
              .findElement(By.css('[data-testid="invokeArgumentType"]'))
              .getText(),
            el
              .findElement(By.css('[data-testid="invokeArgumentValue"]'))
              .getText(),
          ]);

          return {
            type,
            value,
          };
        })
      );

      expect(actualArgs).to.deep.equal([
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

      const paymentElements = await this.driver.findElements(
        By.css('[data-testid="invokeScriptPaymentItem"]')
      );

      const actualPayments = await Promise.all(
        paymentElements.map(el => el.getText())
      );

      expect(actualPayments).to.deep.equal([
        '0.00000001 WAVES',
        '1 NonScriptToken',
      ]);

      expect(
        await invokeScript
          .findElement(By.css('[data-testid="txFee"]'))
          .getText()
      ).to.equal('0.005 WAVES');

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-shadow
      await this.driver.executeScript((data: any) => {
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
      await this.driver.switchTo().window(messageWindow);
      await this.driver.navigate().refresh();
    }

    describe('Version 1', function () {
      async function checkData(this: mocha.Context, script: string) {
        expect(
          await this.driver
            .findElement(By.css('[data-testid="contentScript"]'))
            .getText()
        ).to.equal(script);
      }

      it('Rejected', async function () {
        await performSignCustomData.call(this, CUSTOM_DATA_V1);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkData.call(this, 'base64:AADDEE==');

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
      async function checkDataEntries(
        this: mocha.Context,
        entries: Array<{ key: string; type: string; value: string }>
      ) {
        const dataRows = await this.driver.findElements(
          By.css('[data-testid="dataRow"]')
        );

        const actualItems = await Promise.all(
          dataRows.map(async entryEl => {
            const [key, type, value] = await Promise.all([
              entryEl
                .findElement(By.css('[data-testid="dataRowKey"]'))
                .getText(),
              entryEl
                .findElement(By.css('[data-testid="dataRowType"]'))
                .getText(),
              entryEl
                .findElement(By.css('[data-testid="dataRowValue"]'))
                .getText(),
            ]);

            return {
              key,
              type,
              value,
            };
          })
        );

        expect(actualItems).to.deep.equal(entries);
      }

      it('Rejected', async function () {
        await performSignCustomData.call(this, CUSTOM_DATA_V2);
        await checkOrigin.call(this, WHITELIST[3]);
        await checkAccountName.call(this, 'rich');
        await checkNetworkName.call(this, 'Testnet');

        await checkDataEntries.call(this, [
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
