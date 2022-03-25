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
  ISSUE,
  LEASE,
  MASS_TRANSFER,
  PACKAGE,
  REISSUE,
  SET_ASSET_SCRIPT,
  SET_SCRIPT,
  SPONSORSHIP,
  TRANSFER,
} from './utils/transactions';
import { CANCEL_ORDER, CREATE_ORDER } from './utils/orders';
import { CUSTOM_DATA_V1, CUSTOM_DATA_V2 } from './utils/customData';

const { parse } = create();

describe('Signature', function () {
  this.timeout(5 * 60 * 1000);

  let tabKeeper, tabOrigin;

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
        WavesKeeper.initialPromise.then(api => {
          api.auth({ data: 'generated auth data' });
        });
      });

      await this.driver.switchTo().window(tabKeeper);
    });

    checkAnyTransaction(
      By.xpath("//div[contains(@class, '-auth-transaction')]")
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
          expect(parse(approveResult)).to.deep.contain({
            type: ISSUE.type,
            version: 2,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            name: ISSUE.data.name,
            description: ISSUE.data.description,
            quantity: ISSUE.data.quantity,
            script: ISSUE.data.script,
            decimals: ISSUE.data.precision,
            reissuable: ISSUE.data.reissuable,
            fee: 100400000,
            chainId: 84,
          });
        }
      );

      it('Copying script to the clipboard');
    });

    describe('Transfer', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, TRANSFER);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-transfer-transaction')]"),
        approveResult => {
          expect(parse(approveResult)).to.deep.contain({
            type: TRANSFER.type,
            version: 2,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            assetId: TRANSFER.data.amount.assetId,
            recipient: TRANSFER.data.recipient,
            amount: TRANSFER.data.amount.amount,
            attachment: '3ke2ct1rnYr52Y1jQvzNG',
            fee: 500000,
            feeAssetId: null,
            chainId: 84,
          });
        }
      );
      // TODO this checks should be into unittests
      it('Address');
      it('Alias');
      it('Waves / asset / smart asset');
      it('Attachment');
      it('Transfers to Gateways');
    });

    describe('Reissue', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, REISSUE);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-reissue-transaction')]"),
        approveResult => {
          expect(parse(approveResult)).to.deep.contain({
            type: REISSUE.type,
            version: 2,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            assetId: REISSUE.data.assetId,
            quantity: REISSUE.data.quantity,
            reissuable: REISSUE.data.reissuable,
            chainId: 84,
            fee: 500000,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            type: BURN.type,
            version: 2,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            assetId: BURN.data.assetId,
            amount: BURN.data.amount,
            chainId: 84,
            fee: 500000,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            type: BURN_WITH_QUANTITY.type,
            version: 2,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            assetId: BURN_WITH_QUANTITY.data.assetId,
            amount: BURN_WITH_QUANTITY.data.quantity,
            chainId: 84,
            fee: 500000,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            type: LEASE.type,
            version: 2,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            amount: LEASE.data.amount,
            recipient: LEASE.data.recipient,
            fee: 500000,
            chainId: 84,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            type: CANCEL_LEASE.type,
            version: 2,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            leaseId: CANCEL_LEASE.data.leaseId,
            fee: 500000,
            chainId: 84,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            type: ALIAS.type,
            version: 2,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            alias: ALIAS.data.alias,
            fee: 500000,
            chainId: 84,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            type: MASS_TRANSFER.type,
            version: 1,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            assetId: MASS_TRANSFER.data.totalAmount.assetId,
            transfers: [
              { amount: 1, recipient: 'alias:T:testy' },
              { amount: 1, recipient: 'alias:T:merry' },
            ],
            fee: 600000,
            attachment: '3ke2ct1rnYr52Y1jQvzNG',
            chainId: 84,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            type: DATA.type,
            version: 1,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            fee: 500000,
            chainId: 84,
            data: DATA.data.data,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            type: SET_SCRIPT.type,
            version: 1,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            chainId: 84,
            fee: 1400000,
            script: SET_SCRIPT.data.script,
          });
        }
      );

      it('Copying script to the clipboard');
      it('Set');
      it('Cancel');
    });

    describe('Sponsorship', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, SPONSORSHIP);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-sponsorship-transaction')]"),
        approveResult => {
          expect(parse(approveResult)).to.deep.contain({
            type: SPONSORSHIP.type,
            version: 1,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            minSponsoredAssetFee: SPONSORSHIP.data.minSponsoredAssetFee.amount,
            assetId: SPONSORSHIP.data.minSponsoredAssetFee.assetId,
            fee: 500000,
            chainId: 84,
          });
        }
      );

      it('Set');
      it('Cancel');
    });

    describe('SetAssetScript', function () {
      beforeEach(async function () {
        await performSignTransaction.call(this, SET_ASSET_SCRIPT);
      });

      checkAnyTransaction(
        By.xpath("//div[contains(@class, '-assetScript-transaction')]"),
        approveResult => {
          expect(parse(approveResult)).to.deep.contain({
            type: SET_ASSET_SCRIPT.type,
            version: 1,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            assetId: SET_ASSET_SCRIPT.data.assetId,
            chainId: 84,
            fee: 100400000,
            script: SET_ASSET_SCRIPT.data.script,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            type: INVOKE_SCRIPT.type,
            version: 1,
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            dApp: INVOKE_SCRIPT.data.dApp,
            call: INVOKE_SCRIPT.data.call,
            payment: INVOKE_SCRIPT.data.payment,
            fee: 500000,
            feeAssetId: null,
            chainId: 84,
          });
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

    describe('UpdateAssetInfo', function () {
      it('Not supported yet');
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
          expect(parse(approveResult)).to.deep.contain({
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
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            matcherFeeAssetId: null,
          });
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
          expect(parse(approveResult)).to.deep.contain({
            orderId: CANCEL_ORDER.data.id,
            sender: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
          });
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

        expect(parse(approveResult[0])).to.deep.contain({
          type: ISSUE.type,
          version: 2,
          senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
          name: ISSUE.data.name,
          description: ISSUE.data.description,
          quantity: ISSUE.data.quantity,
          script: ISSUE.data.script,
          decimals: ISSUE.data.precision,
          reissuable: ISSUE.data.reissuable,
          fee: 100400000,
          chainId: 84,
        });

        expect(parse(approveResult[1])).to.deep.contain({
          type: TRANSFER.type,
          version: 2,
          senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
          assetId: TRANSFER.data.amount.assetId,
          recipient: TRANSFER.data.recipient,
          amount: TRANSFER.data.amount.amount,
          attachment: '3ke2ct1rnYr52Y1jQvzNG',
          fee: 500000,
          feeAssetId: null,
          chainId: 84,
        });

        expect(parse(approveResult[2])).to.deep.contain({
          type: REISSUE.type,
          version: 2,
          senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
          assetId: REISSUE.data.assetId,
          quantity: REISSUE.data.quantity,
          reissuable: REISSUE.data.reissuable,
          chainId: 84,
          fee: 500000,
        });

        expect(parse(approveResult[3])).to.deep.contain({
          type: BURN.type,
          version: 2,
          senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
          assetId: BURN.data.assetId,
          amount: BURN.data.amount,
          chainId: 84,
          fee: 500000,
        });

        expect(parse(approveResult[4])).to.deep.contain({
          type: LEASE.type,
          version: 2,
          senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
          amount: LEASE.data.amount,
          recipient: LEASE.data.recipient,
          fee: 500000,
          chainId: 84,
        });

        expect(parse(approveResult[5])).to.deep.contain({
          type: CANCEL_LEASE.type,
          version: 2,
          senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
          leaseId: CANCEL_LEASE.data.leaseId,
          fee: 500000,
          chainId: 84,
        });

        expect(parse(approveResult[6])).to.deep.contain({
          type: INVOKE_SCRIPT.type,
          version: 1,
          senderPublicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
          dApp: INVOKE_SCRIPT.data.dApp,
          call: INVOKE_SCRIPT.data.call,
          payment: INVOKE_SCRIPT.data.payment,
          fee: 500000,
          feeAssetId: null,
          chainId: 84,
        });
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
          expect(JSON.parse(approveResult)).to.deep.contain({
            binary: CUSTOM_DATA_V1.binary,
            version: CUSTOM_DATA_V1.version,
            publicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            hash: 'BddvukE8EsQ22TC916wr9hxL5MTinpcxj7cKmyQFu1Qj',
          });
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
          expect(JSON.parse(approveResult)).to.deep.contain({
            data: CUSTOM_DATA_V2.data,
            version: CUSTOM_DATA_V2.version,
            publicKey: 'AXbaBkJNocyrVpwqTzD4TpUY8fQ6eeRto9k1m2bNCzXV',
            hash: 'CntDRDubtuhwBKsmCTtZzMLVF9TFK6hLoWP424V8Zz2K',
          });
        }
      );
    });
  });
});
