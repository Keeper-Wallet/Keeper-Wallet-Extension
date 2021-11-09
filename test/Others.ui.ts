import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { App } from './utils/actions';

describe('Others', function () {
  this.timeout(60 * 1000);

  before(async function () {
    await App.initVault.call(this);
  });

  after(async function () {
    await App.resetVault.call(this);
  });

  it('The current version of the extension is displayed', async function () {
    const { version } = require('../package');

    expect(
      await this.driver
        .wait(
          until.elementLocated(
            By.xpath(
              "//div[contains(@class, '-bottom-bottom')]//div[contains(@class, 'version')]"
            )
          ),
          this.wait
        )
        .getText()
    ).matches(new RegExp(version, 'g'));
  });

  it(
    'After signAndPublishTransaction() "View transaction" button leads to the correct Explorer'
  );

  it(
    'Signature requests are automatically removed from pending requests after 30 minutes'
  );

  it('Switch account on confirmation screen');

  it('Send more transactions for signature when different screens are open');
});
