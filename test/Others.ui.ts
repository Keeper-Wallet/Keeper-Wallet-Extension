import { expect } from 'chai';
import { By, until } from 'selenium-webdriver';
import { App, CreateNewAccount, Network } from './utils/actions';

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

  describe('Send WAVES', function () {
    before(async function () {
      await Network.switchTo.call(this, 'Testnet');
      await CreateNewAccount.importAccount.call(
        this,
        'rich',
        'waves private node seed with waves tokens'
      );
    });

    beforeEach(async function () {
      const actions = this.driver.actions({ async: true });
      await actions
        .move({
          origin: await this.driver.wait(
            until.elementLocated(
              By.css('[data-testid="WAVES"] [data-testid="moreBtn"]')
            ),
            this.wait
          ),
        })
        .perform();

      await this.driver
        .wait(
          until.elementLocated(
            By.css('[data-testid="WAVES"] [data-testid="sendBtn"]')
          ),
          this.wait
        )
        .click();
    });

    afterEach(async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="rejectButton"]')),
          this.wait
        )
        .click();

      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="closeTransaction"]')),
          this.wait
        )
        .click();
    });

    it('Send WAVES to an address', async function () {
      expect(
        await this.driver.switchTo().activeElement().getAttribute('data-testid')
      ).to.equal('recipientInput');

      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="recipientInput"]')),
          this.wait
        )
        .sendKeys('3MsX9C2MzzxE4ySF5aYcJoaiPfkyxZMg4cW');

      const amountInput = await this.driver.findElement(
        By.css('[data-testid="amountInput"]')
      );

      await amountInput.sendKeys('123123123.123');

      expect(
        await this.driver.executeScript(function () {
          return arguments[0].value;
        }, amountInput)
      ).to.equal('123 123 123.123');

      await amountInput.clear();
      await amountInput.sendKeys('0.123');

      await this.driver
        .findElement(By.css('[data-testid="attachmentInput"]'))
        .sendKeys('This is an attachment');

      const submitButton = await this.driver.findElement(
        By.css('[data-testid="submitButton"]')
      );

      await submitButton.click();

      expect(await submitButton.isEnabled()).to.equal(false);

      const transferAmount = await this.driver.wait(
        until.elementLocated(By.css('[data-testid="transferAmount"]')),
        this.wait
      );

      expect(await transferAmount.getText()).to.equal(
        '-\n0\n.12300000\n Waves'
      );

      expect(
        await this.driver
          .findElement(By.css('[data-testid="recipient"]'))
          .getText()
      ).to.equal('3MsX9C2MzzxE4ySF5aYcJoaiPfkyxZMg4cW');

      expect(
        await this.driver
          .findElement(By.css('[data-testid="attachmentContent"]'))
          .getText()
      ).to.equal('This is an attachment');
    });

    it('Send assets to an alias', async function () {
      await this.driver
        .wait(
          until.elementLocated(By.css('[data-testid="recipientInput"]')),
          this.wait
        )
        .sendKeys('an_alias');

      await this.driver
        .findElement(By.css('[data-testid="amountInput"]'))
        .sendKeys('0.87654321');

      await this.driver
        .findElement(By.css('[data-testid="attachmentInput"]'))
        .sendKeys('This is an attachment');

      await this.driver
        .findElement(By.css('[data-testid="submitButton"]'))
        .click();

      const transferAmount = await this.driver.wait(
        until.elementLocated(By.css('[data-testid="transferAmount"]')),
        this.wait
      );

      expect(await transferAmount.getText()).to.equal(
        '-\n0\n.87654321\n Waves'
      );

      expect(
        await this.driver
          .findElement(By.css('[data-testid="recipient"]'))
          .getText()
      ).to.equal('an_alias');

      expect(
        await this.driver
          .findElement(By.css('[data-testid="attachmentContent"]'))
          .getText()
      ).to.equal('This is an attachment');
    });
  });
});
