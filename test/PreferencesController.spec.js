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
        controller.addAccount({address: '1', type: 'ledger'});
        controller.addAccount({address: '2', type: 'ledger'});
        const state = controller.store.getState();
        expect(state.accounts).to.eql([
            {address: '1', type: 'ledger', name: 'Account 1'},
            {address: '2', type: 'ledger', name: 'Account 2'},
        ])
    });

    it('Should sync accounts from wallets passed as array', () => {
        controller.addAccount({address: '1', type: 'ledger'});
        controller.addAccount({address: '2', type: 'ledger', name: 'yahoo'});
        controller.syncAccounts([{address: '2', type: 'ledger'}, {address: '3', type: 'ledger'}]);
        const state = controller.store.getState();
        expect(state.accounts).to.eql([
            {name: "yahoo", address: "2", type: "ledger",},
            {name: "Account 2", address: "3", type: "ledger"}
        ])
    });

    it('Should add label to account', () => {
        controller.addAccount({address: '1', type: 'ledger'});
        controller.addLabel({address: '1'}, 'yahoo');
        const account = controller._getAccountByAddress('1');
        expect(account.name).to.eql('yahoo')
    });

    it('Should select account', () => {
        controller.addAccount({address: '1', type: 'ledger'});
        controller.selectAccount('1');
        const state = controller.store.getState();
        expect(state.selectedAccount).to.eql('1')
    })
});