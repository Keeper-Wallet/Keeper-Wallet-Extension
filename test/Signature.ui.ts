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
import { App, CreateNewAccount, Network, Settings } from './utils/actions';
import {
  CUSTOMLIST,
  DEFAULT_PAGE_LOAD_DELAY,
  WHITELIST,
} from './utils/constants';
import { By, until, WebElement } from 'selenium-webdriver';
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
  MASS_TRANSFER,
  MASS_TRANSFER_WITHOUT_ATTACHMENT,
  PACKAGE,
  REISSUE,
  SET_ASSET_SCRIPT,
  SET_SCRIPT,
  SET_SCRIPT_WITHOUT_SCRIPT,
  SPONSORSHIP_REMOVAL,
  SPONSORSHIP,
  TRANSFER,
  TRANSFER_WITHOUT_ATTACHMENT,
  UPDATE_ASSET_INFO,
} from './utils/transactions';
import { CANCEL_ORDER, CREATE_ORDER } from './utils/orders';
import { CUSTOM_DATA_V1, CUSTOM_DATA_V2 } from './utils/customData';

const { parse } = create();

describe('Signature', function () {
  this.timeout(5 * 60 * 1000);

  let tabKeeper, tabOrigin;

  const senderPublicKey = 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV';

  before(async function () {
    await App.initVault.call(this);
    await Settings.setMaxSessionTimeout.call(this);
    await App.open.call(this);

    await Network.switchToAndCheck.call(this, 'Testnet');

    tabKeeper = await this.driver.getWindowHandle();
    await this.driver
      .wait(
        until.elementLocated(By.css('[data-testid="importForm"]')),
        this.wait
      )
      .findElement(By.css('[data-testid="addAccountBtn"]'))
      .click();
    await this.driver.wait(
      async () => (await this.driver.getAllWindowHandles()).length === 2,
      this.wait
    );
    for (const handle of await this.driver.getAllWindowHandles()) {
      if (handle !== tabKeeper) {
        await this.driver.switchTo().window(handle);
        await this.driver.navigate().refresh();
        break;
      }
    }
    await CreateNewAccount.importAccount.call(
      this,
      'rich',
      'waves private node seed with waves tokens'
    );
    await this.driver.switchTo().window(tabKeeper);

    await this.driver.switchTo().newWindow('tab');
    tabOrigin = await this.driver.getWindowHandle();
  });

  after(async function () {
    await App.closeBgTabs.call(this, tabKeeper);
    await App.resetVault.call(this);
  });

  function checkAnyTransaction(
    txFormLocator: By,
    checkApproveResult?: (approveResult: any) => void,
    wait?: number
  ) {
    it('Is shown', async function () {
      expect(
        await this.driver.wait(
          until.elementLocated(txFormLocator),
          wait || this.wait
        )
      ).not.to.be.throw;
      await this.driver.wait(
        until.elementIsEnabled(
          this.driver.findElement(By.css('button#approve'))
        ),
        this.wait
      );
      await this.driver.findElement(By.css('button#reject')).click();
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath("//div[contains(@class, '-final-transaction')]")
          ),
          this.wait
        )
        .findElement(By.css('button#close'))
        .click();
      await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-assets-assets')]")
        ),
        this.wait
      );
    });

    it('Rejected', async function () {
      await this.driver.wait(
        until.elementLocated(txFormLocator),
        wait || this.wait
      );
      await this.driver.wait(
        until.elementIsEnabled(
          this.driver.findElement(By.css('button#approve'))
        ),
        this.wait
      );
      await this.driver.findElement(By.css('button#reject')).click();
      const txFinalEl: WebElement = this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-final-transaction')]")
        ),
        this.wait
      );
      expect(await txFinalEl.findElements(By.css('.tx-reject-icon'))).length(1);
      await txFinalEl.findElement(By.css('button#close')).click();
      await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-assets-assets')]")
        ),
        this.wait
      );
    });

    it('Approved', async function () {
      await this.driver.wait(
        until.elementLocated(txFormLocator),
        wait || this.wait
      );
      await this.driver
        .wait(
          until.elementIsEnabled(
            this.driver.findElement(By.css('button#approve'))
          ),
          this.wait
        )
        .click();
      const txFinalEl: WebElement = await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-final-transaction')]")
        ),
        this.wait
      );
      expect(await txFinalEl.findElements(By.css('.tx-approve-icon'))).length(
        1
      );
      await txFinalEl.findElement(By.css('button#close')).click();
      await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-assets-assets')]")
        ),
        this.wait
      );

      await this.driver.switchTo().window(tabOrigin);
      const approveResult = await this.driver.executeScript(
        () => (window as any).approveResult
      );
      await this.driver.switchTo().window(tabKeeper);

      if (checkApproveResult != null) {
        checkApproveResult(approveResult);
      }
    });
  }

  describe('Permission request from origin', function () {
    let authFormLocator = By.xpath(
      "//div[contains(@class, '-originAuth-transaction')]"
    );
    const REJECT_FOREVER = 'Reject forever';
    let lastOrigin;

    beforeEach(async function () {
      await this.driver.switchTo().window(tabOrigin);

      const origin =
        this.currentTest.title != REJECT_FOREVER
          ? CUSTOMLIST[0]
          : CUSTOMLIST[1];
      if (origin !== lastOrigin) {
        await this.driver.get(`http://${origin}`);
      }
      await this.driver.executeScript(() => {
        // @ts-ignore
        WavesKeeper.initialPromise.then(api => {
          api.publicState();
        });
      });

      await this.driver.switchTo().window(tabKeeper);
    });

    checkAnyTransaction(authFormLocator);

    it(REJECT_FOREVER, async function () {
      await this.driver.wait(until.elementLocated(authFormLocator), this.wait);
      await this.driver
        .findElement(
          By.xpath(
            "//button[contains(@class, '-dropdownButton-dropdownButton')]"
          )
        )
        .click();
      await this.driver
        .wait(until.elementLocated(By.css('button#rejectForever')), this.wait)
        .click();
      const txFinalEl: WebElement = await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-final-transaction')]")
        ),
        this.wait
      );
      expect(await txFinalEl.findElements(By.css('.tx-reject-icon'))).length(1);
      await txFinalEl.findElement(By.css('button#close')).click();
      await this.driver.wait(
        until.elementLocated(
          By.xpath("//div[contains(@class, '-assets-assets')]")
        ),
        this.wait
      );
    });
  });

  describe('Authentication request from origin', function () {
    before(async function () {
      await this.driver.switchTo().window(tabOrigin);
      await this.driver.get(`http://${WHITELIST[3]}`);
      await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
    });

    beforeEach(async function () {
      await this.driver.switchTo().window(tabOrigin);

      await this.driver.executeScript(() => {
        // @ts-ignore
        WavesKeeper.initialPromise
          .then(api => api.auth({ data: 'generated auth data' }))
          .then(
            result => {
              (window as any).approveResult = JSON.stringify(result);
            },
            () => {
              (window as any).approveResult = null;
            }
          );
      });

      await this.driver.switchTo().window(tabKeeper);
    });

    checkAnyTransaction(
      By.xpath("//div[contains(@class, '-auth-transaction')]"),
      approveResult => {
        const parsedApproveResult = JSON.parse(approveResult);

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

        expect(parsedApproveResult).to.deep.contain(expectedApproveResult);

        expect(
          verifySignature(senderPublicKey, bytes, parsedApproveResult.signature)
        ).to.be.true;
      }
    );
  });

  describe('Matcher request', function () {
    const timestamp = Date.now();

    before(async function () {
      await this.driver.switchTo().window(tabOrigin);
      await this.driver.get(`http://${WHITELIST[3]}`);
      await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
    });

    beforeEach(async function () {
      await this.driver.switchTo().window(tabOrigin);

      await this.driver.executeScript(
        (senderPublicKey, timestamp) => {
          WavesKeeper.initialPromise
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
                (window as any).approveResult = result;
              },
              () => {
                (window as any).approveResult = null;
              }
            );
        },
        senderPublicKey,
        timestamp
      );

      await this.driver.switchTo().window(tabKeeper);
    });

    checkAnyTransaction(
      By.xpath("//div[contains(@class, '-matcher-transaction')]"),
      signature => {
        const bytes = concat(
          serializePrimitives.BASE58_STRING(senderPublicKey),
          serializePrimitives.LONG(timestamp)
        );

        expect(verifySignature(senderPublicKey, bytes, signature)).to.be.true;
      }
    );
  });

  describe('Transactions', function () {
    async function performSignTransaction(this: mocha.Context, tx: any) {
      await this.driver.switchTo().window(tabOrigin);

      await this.driver.executeScript(tx => {
        // @ts-ignore
        WavesKeeper.initialPromise
          .then(api => api.signTransaction(tx))
          .then(
            result => {
              (window as any).approveResult = result;
            },
            () => {
              (window as any).approveResult = null;
            }
          );
      }, tx);

      await this.driver.switchTo().window(tabKeeper);
    }

    before(async function () {
      await this.driver.switchTo().window(tabOrigin);
      await this.driver.get(`http://${WHITELIST[3]}`);
      await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
    });

    describe('Issue', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, ISSUE);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-issue-transaction')]"),
        approveResult => {
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
        }
      );

      it('Copying script to the clipboard');
    });

    describe('Issue without script', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, ISSUE_WITHOUT_SCRIPT);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-issue-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: ISSUE_WITHOUT_SCRIPT.type,
            version: 2,
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
        }
      );
    });

    describe('Transfer', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, TRANSFER);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-transfer-transaction')]"),
        approveResult => {
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
        }
      );
      // TODO this checks should be into unittests
      it('Address');
      it('Alias');
      it('Waves / asset / smart asset');
      it('Attachment');
      it('Transfers to Gateways');
    });

    describe('Transfer without attachment', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, TRANSFER_WITHOUT_ATTACHMENT);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-transfer-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: TRANSFER_WITHOUT_ATTACHMENT.type,
            version: 2,
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
        }
      );
    });

    describe('Reissue', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, REISSUE);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-reissue-transaction')]"),
        approveResult => {
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
        }
      );
    });

    describe('Burn', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, BURN);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-burn-transaction')]"),
        approveResult => {
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
        }
      );
    });

    describe('Burn with quantity instead of amount', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, BURN_WITH_QUANTITY);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-burn-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: BURN_WITH_QUANTITY.type,
            version: 2,
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
        }
      );
    });

    describe('Lease', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, LEASE);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-lease-transaction')]"),
        approveResult => {
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
        }
      );
    });

    describe('Lease with alias', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, LEASE_WITH_ALIAS);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-lease-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: LEASE_WITH_ALIAS.type,
            version: 2,
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
        }
      );
    });

    describe('Cancel lease', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, CANCEL_LEASE);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-cancelLease-transaction')]"),
        approveResult => {
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
        }
      );
    });

    describe('Alias', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, ALIAS);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-alias-transaction')]"),
        approveResult => {
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
        }
      );
      // TODO this checks should be into unittests
      it('Minimum alias length');
      it('Maximum alias length');
    });

    describe('MassTransfer', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, MASS_TRANSFER);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-massTransfer-transaction')]"),
        approveResult => {
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
        }
      );
    });

    describe('MassTransfer without attachment', function () {
      beforeEach(async function () {
        await performSignTransaction.call(
          this,
          MASS_TRANSFER_WITHOUT_ATTACHMENT
        );
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-massTransfer-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: MASS_TRANSFER_WITHOUT_ATTACHMENT.type,
            version: 1,
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
        }
      );
    });

    describe('Data', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, DATA);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-data-transaction')]"),
        approveResult => {
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
        }
      );
    });

    describe('SetScript', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, SET_SCRIPT);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-setScript-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: SET_SCRIPT.type,
            version: 1,
            senderPublicKey,
            chainId: 84,
            fee: 1400000,
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
        }
      );

      it('Copying script to the clipboard');
      it('Set');
      it('Cancel');
    });

    describe('SetScript without script', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, SET_SCRIPT_WITHOUT_SCRIPT);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-setScript-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: SET_SCRIPT_WITHOUT_SCRIPT.type,
            version: 1,
            senderPublicKey,
            chainId: 84,
            fee: 1400000,
          };

          const bytes = makeTxBytes({
            ...expectedApproveResult,
            script: SET_SCRIPT_WITHOUT_SCRIPT.data.script,
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
        }
      );
    });

    describe('Sponsorship', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, SPONSORSHIP);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-sponsorship-transaction')]"),
        approveResult => {
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
        }
      );

      it('Set');
      it('Cancel');
    });

    describe('Sponsorship removal', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, SPONSORSHIP_REMOVAL);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-sponsorship-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: SPONSORSHIP_REMOVAL.type,
            version: 1,
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
        }
      );
    });

    describe('SetAssetScript', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, SET_ASSET_SCRIPT);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-assetScript-transaction')]"),
        approveResult => {
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
        }
      );

      it('Copying script to the clipboard');
    });

    describe('InvokeScript', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, INVOKE_SCRIPT);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-scriptInvocation-transaction')]"),
        approveResult => {
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
        }
      );

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
    });

    describe('InvokeScript without call', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, INVOKE_SCRIPT_WITHOUT_CALL);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-scriptInvocation-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            type: INVOKE_SCRIPT_WITHOUT_CALL.type,
            version: 1,
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
        }
      );
    });

    describe('UpdateAssetInfo', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, UPDATE_ASSET_INFO);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-index-transaction')]"),
        approveResult => {
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
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        }
      );
    });
  });

  describe('Order', function () {
    const createOrder = tx => {
      // @ts-ignore
      WavesKeeper.initialPromise
        .then(api => api.signOrder(tx))
        .then(
          result => {
            (window as any).approveResult = result;
          },
          () => {
            (window as any).approveResult = null;
          }
        );
    };
    const cancelOrder = tx => {
      // @ts-ignore
      WavesKeeper.initialPromise
        .then(api => api.signCancelOrder(tx))
        .then(
          result => {
            (window as any).approveResult = result;
          },
          () => {
            (window as any).approveResult = null;
          }
        );
    };

    async function performSignOrder(script: (tx: any) => {}, tx: any) {
      await this.driver.switchTo().window(tabOrigin);

      await this.driver.executeScript(script, tx);

      await this.driver.switchTo().window(tabKeeper);
    }

    before(async function () {
      await this.driver.switchTo().window(tabOrigin);
      await this.driver.get(`http://${WHITELIST[3]}`);
      await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
    });

    describe('Create', function () {
      beforeEach(async function () {
        await performSignOrder.call(this, createOrder, CREATE_ORDER);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-createOrder-transaction')]"),
        approveResult => {
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
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.proofs[0]
            )
          ).to.be.true;
        },
        60 * 1000
      );
    });

    describe('Cancel', function () {
      beforeEach(async function () {
        await performSignOrder.call(this, cancelOrder, CANCEL_ORDER);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-cancelOrder-transaction')]"),
        approveResult => {
          const parsedApproveResult = parse(approveResult);

          const expectedApproveResult = {
            orderId: CANCEL_ORDER.data.id,
            sender: senderPublicKey,
          };

          const bytes = cancelOrderParamsToBytes(expectedApproveResult);

          expect(parsedApproveResult).to.deep.contain(expectedApproveResult);

          expect(
            verifySignature(
              senderPublicKey,
              bytes,
              parsedApproveResult.signature
            )
          ).to.be.true;
        }
      );
    });
  });

  describe('Multiple transactions package', function () {
    async function performSignTransactionPackage(tx: any[], name: string) {
      await this.driver.switchTo().window(tabOrigin);

      await this.driver.executeScript(
        (tx, name) => {
          // @ts-ignore
          WavesKeeper.initialPromise
            .then(api => api.signTransactionPackage(tx, name))
            .then(
              result => {
                (window as any).approveResult = result;
              },
              () => {
                (window as any).approveResult = null;
              }
            );
        },
        tx,
        name
      );

      await this.driver.switchTo().window(tabKeeper);
    }

    before(async function () {
      await this.driver.switchTo().window(tabOrigin);
      await this.driver.get(`http://${WHITELIST[3]}`);
      await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
    });

    beforeEach(async function () {
      await performSignTransactionPackage.call(this, PACKAGE, 'Test package');
    });

    checkAnyTransaction(
      By.xpath("//div[contains(@class, '-package-transaction')]"),
      approveResult => {
        expect(approveResult).to.have.length(7);

        const parsedApproveResult = approveResult.map(parse);

        const expectedApproveResult0 = {
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

        const bytes0 = makeTxBytes({
          ...expectedApproveResult0,
          timestamp: parsedApproveResult[0].timestamp,
        });

        expect(parsedApproveResult[0]).to.deep.contain(expectedApproveResult0);
        expect(parsedApproveResult[0].id).to.equal(
          base58Encode(blake2b(bytes0))
        );

        expect(
          verifySignature(
            senderPublicKey,
            bytes0,
            parsedApproveResult[0].proofs[0]
          )
        ).to.be.true;

        const expectedApproveResult1 = {
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

        const bytes1 = makeTxBytes({
          ...expectedApproveResult1,
          timestamp: parsedApproveResult[1].timestamp,
        });

        expect(parsedApproveResult[1]).to.deep.contain(expectedApproveResult1);
        expect(parsedApproveResult[1].id).to.equal(
          base58Encode(blake2b(bytes1))
        );

        expect(
          verifySignature(
            senderPublicKey,
            bytes1,
            parsedApproveResult[1].proofs[0]
          )
        ).to.be.true;

        const expectedApproveResult2 = {
          type: REISSUE.type,
          version: 2,
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
        expect(parsedApproveResult[2].id).to.equal(
          base58Encode(blake2b(bytes2))
        );

        expect(
          verifySignature(
            senderPublicKey,
            bytes2,
            parsedApproveResult[2].proofs[0]
          )
        ).to.be.true;

        const expectedApproveResult3 = {
          type: BURN.type,
          version: 2,
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
        expect(parsedApproveResult[3].id).to.equal(
          base58Encode(blake2b(bytes3))
        );

        expect(
          verifySignature(
            senderPublicKey,
            bytes3,
            parsedApproveResult[3].proofs[0]
          )
        ).to.be.true;

        const expectedApproveResult4 = {
          type: LEASE.type,
          version: 2,
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
        expect(parsedApproveResult[4].id).to.equal(
          base58Encode(blake2b(bytes4))
        );

        expect(
          verifySignature(
            senderPublicKey,
            bytes4,
            parsedApproveResult[4].proofs[0]
          )
        ).to.be.true;

        const expectedApproveResult5 = {
          type: CANCEL_LEASE.type,
          version: 2,
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
        expect(parsedApproveResult[5].id).to.equal(
          base58Encode(blake2b(bytes5))
        );

        expect(
          verifySignature(
            senderPublicKey,
            bytes5,
            parsedApproveResult[5].proofs[0]
          )
        ).to.be.true;

        const expectedApproveResult6 = {
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

        const bytes6 = makeTxBytes({
          ...expectedApproveResult6,
          timestamp: parsedApproveResult[6].timestamp,
        });

        expect(parsedApproveResult[6]).to.deep.contain(expectedApproveResult6);
        expect(parsedApproveResult[6].id).to.equal(
          base58Encode(blake2b(bytes6))
        );

        expect(
          verifySignature(
            senderPublicKey,
            bytes6,
            parsedApproveResult[6].proofs[0]
          )
        ).to.be.true;
      }
    );
  });

  describe('Custom data', function () {
    async function performSignCustomData(data: any) {
      await this.driver.switchTo().window(tabOrigin);

      await this.driver.executeScript(data => {
        // @ts-ignore
        WavesKeeper.initialPromise
          .then(api => api.signCustomData(data))
          .then(
            result => {
              (window as any).approveResult = JSON.stringify(result);
            },
            () => {
              (window as any).approveResult = null;
            }
          );
      }, data);

      await this.driver.switchTo().window(tabKeeper);
    }

    before(async function () {
      await this.driver.switchTo().window(tabOrigin);
      await this.driver.get(`http://${WHITELIST[3]}`);
      await this.driver.sleep(DEFAULT_PAGE_LOAD_DELAY);
    });

    describe('Version 1', function () {
      beforeEach(async function () {
        await performSignCustomData.call(this, CUSTOM_DATA_V1);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-customData-transaction')]"),
        approveResult => {
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
        }
      );
    });

    describe('Version 2', function () {
      beforeEach(async function () {
        await performSignCustomData.call(this, CUSTOM_DATA_V2);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-customData-transaction')]"),
        approveResult => {
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
        }
      );
    });
  });
});
