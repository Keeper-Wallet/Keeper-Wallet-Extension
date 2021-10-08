import { App, CreateNewAccount, DEFAULT_PASSWORD } from './utils/actions';
import { By, until } from 'selenium-webdriver';

describe('Account management', function () {
    before(async function () {
        await App.initVault.call(this, DEFAULT_PASSWORD);
        await CreateNewAccount.importAccount('rich', 'waves private node seed with waves tokens');

        await this.driver
            .wait(until.elementLocated(By.xpath("//div[contains(@class, '-assets-addAccount')]")), this.wait)
            .click();
        await CreateNewAccount.importAccount('poor', 'waves private node seed without waves tokens');
    });

    after(async function () {
        await App.resetVault.call(this);
    });

    describe('Accounts list', function () {
        it('Change active account');
        it('Updating account balances on import');
        it('The balance reflects the leased WAVES');
        it('Copying the address of the active account on the accounts screen');

        describe('Show QR', function () {
            it('Opening the screen with the QR code of the address by clicking the "Show QR" button');
            it('Check that QR matches the displayed address');
            it('Download QR code'); // file downloaded, filename equals "${address}.png"
        });
    });

    const accountPropertiesShouldBeRight = () => {
        it('Displayed right "Active"-status icon');
        it('Go to the address QR code screen');

        describe('Address', function () {
            it('Is displayed');
            it('Copying by clicking the "Copy" button');
        });

        describe('Public key', function () {
            it('Is displayed');
            it('Copying by clicking the "Copy" button');
        });

        describe('Private key', function () {
            it('Is displayed');
            describe('Copying by clicking the "Copy" button', function () {
                it('Clicking "Cancel" does not copy');
                it('Copying by clicking the "Copy" button and entering the correct password');
            });
        });

        describe('Backup phrase', function () {
            it('Is displayed');
            describe('Copying by clicking the "Copy" button', function () {
                it('Clicking "Cancel" does not copy');
                it('Copying by clicking the "Copy" button and entering the correct password');
            });
        });

        describe('Rename an account', () => {
            it('A name that is already in use cannot be specified');
            it('Unique name specified');
        });

        describe('Delete account', () => {
            it('Click "Back" on the account deletion confirmation screen - the account is not deleted');
            it('Click "Delete account" deletes the account');
        });
    };

    describe('Active account', async function () {
        it('By clicking on account - go to the account properties screen');
        await accountPropertiesShouldBeRight.call(this);
    });

    describe('Inactive account', async function () {
        it('By clicking on account - go to the account properties screen');
        await accountPropertiesShouldBeRight.call(this);
    });

    describe('Opening a new Wallet tab by clicking the "Wallet" button', () => {
        it('Mainnet');
        it('Testnet');
        it('Stagenet');
        it('Custom');
    });
    describe('Opening a new Explorer tab by clicking the "Transactions" button', () => {
        it('Mainnet');
        it('Testnet');
        it('Stagenet');
        it('Custom');
    });
});
