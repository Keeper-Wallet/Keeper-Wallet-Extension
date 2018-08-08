import {expect, assert} from 'chai';
import {PreferencesController} from "../src/controllers";

describe("Preferences Controller", () => {
    let controller;

    beforeEach(() => {
        controller = new PreferencesController();
    });

    it('Should have correct default state', () => {
        const defaults = {
            currentLocale: 'en',
            accounts: [],
            selectedAccount: undefined
        };
        expect(controller.store.getState()).to.eql(defaults)
    });

    it('Should set locale', () => {
        controller.setCurrentLocale('ru');
        const state = controller.store.getState();
        expect(state.currentLocale).to.eql('ru')
    });

    it('Should add new accounts', () => {
        controller.addAccount({publicKey: '1', type: 'ledger'});
        controller.addAccount({publicKey: '2', type: 'ledger'});
        const state = controller.store.getState();
        expect(state.accounts).to.eql([
            {publicKey: '1', type: 'ledger', name: 'Account 1'},
            {publicKey: '2', type: 'ledger', name: 'Account 2'},
        ])
    });

    it('Should sync accounts from wallets passed as array', () => {
        controller.addAccount({publicKey: '1', type: 'ledger'});
        controller.addAccount({publicKey: '2', type: 'ledger', name: 'yahoo'});
        controller.syncAccounts([{publicKey: '2', type: 'ledger'}, {publicKey: '3', type: 'ledger'}]);
        const state = controller.store.getState();
        expect(state.accounts).to.eql([
            {name: "yahoo", publicKey: "2", type: "ledger",},
            {name: "Account 2", publicKey: "3", type: "ledger"}
        ])
    });

    it('Should add label to account', () => {
        controller.addAccount({publicKey: '1', type: 'ledger'});
        controller.addLabel({publicKey: '1'}, 'yahoo');
        const account = controller._getAccountByPk('1');
        expect(account.name).to.eql('yahoo')
    });

    it('Should select account', () => {
        controller.addAccount({publicKey: '1', type: 'ledger'});
        controller.selectAccount({publicKey: '1'});
        const state = controller.store.getState();
        expect(state.selectedAccount).to.eql('1')
    })
});