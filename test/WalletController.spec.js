import {expect, assert} from 'chai';
import {WalletController} from "../src/controllers";


describe('WalletController', () => {
    const password = 'example';
    const seed = 'some useful example seed with neede lenght of twenty bytes'
    it('Should init vault', () => {
        const controller = new WalletController();
        controller.initVault(password);
        expect(controller.store.getState().vault).to.be.a('string')
    });

    it('Should not init vault without password', () => {
        const controller = new WalletController();
        expect(() => controller.initVault()).to.throw('Password is required')
    });

    it('Should create controller from init state and lock/unlock it', () => {
        const controller = new WalletController({initState: {vault: "U2FsdGVkX1+08/Eyk1Qqpl7VonI2m5XQ/QqWFFrE8RU="}});
        controller.unlock(password);
        expect(controller.store.getState().locked).to.be.false;
        controller.lock();
        expect(controller.store.getState().locked).to.be.true;
    });

    it('Should add wallets', () => {
        const controller = new WalletController({initState: {vault: "U2FsdGVkX1+08/Eyk1Qqpl7VonI2m5XQ/QqWFFrE8RU="}});
        controller.unlock(password);
        controller.addWallet('seed', seed);
        expect(controller.wallets.length).to.eq(1)
    });

    it('Should not add duplicate wallets', () => {
        const controller = new WalletController({initState: {vault: "U2FsdGVkX1+08/Eyk1Qqpl7VonI2m5XQ/QqWFFrE8RU="}});
        controller.unlock(password);
        controller.addWallet('seed', seed);
        expect(() => controller.addWallet('seed', seed)).to.throw(/Account with public key .+/)
    });

    it('Should remove wallets', () => {
        const controller = new WalletController({initState: {vault: "U2FsdGVkX1+08/Eyk1Qqpl7VonI2m5XQ/QqWFFrE8RU="}});
        controller.unlock(password);
        controller.addWallet('seed', seed);
        controller.addWallet('seed', seed + ' 1');

        controller.removeWallet(controller.wallets[0].getAccount().publicKey);
        expect(controller.wallets.length).to.eq(1)
    });

    it('Should export account', () => {
        const controller = new WalletController({initState: {vault: "U2FsdGVkX1+08/Eyk1Qqpl7VonI2m5XQ/QqWFFrE8RU="}});
        controller.unlock(password);
        controller.addWallet('seed', seed);

        const exported = controller.exportAccount(controller.wallets[0].getAccount().publicKey);
        expect(exported).to.eq(seed)
    });
});