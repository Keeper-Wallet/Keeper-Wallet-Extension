import {expect, assert} from 'chai';
import {BalanceController} from "../src/controllers";

describe('BalanceController', () => {
    require('isomorphic-fetch');

    const controller = new BalanceController({
        getAccounts: () => [
            {address: '3N3Cn2pYtqzj7N9pviSesNe8KG9Cmb718Y1'},
            {address: '3MpkdJR4Kf2wS9XGeqANK15tN9YQZib4LaQ'}],
        getNode: () => 'https://testnodes.wavesnodes.com'
    });
    clearInterval(controller.poller);

    it('Should update balances', async () => {
        await controller.updateBalances();
        const state = controller.store.getState();
        expect(Object.keys(state.balances)).to.eql(['3N3Cn2pYtqzj7N9pviSesNe8KG9Cmb718Y1','3MpkdJR4Kf2wS9XGeqANK15tN9YQZib4LaQ'])
    });

});