import {expect, assert} from 'chai';
import {MessageController} from "../src/controllers";

describe("MessageController", () => {
    require('isomorphic-fetch');

    let controller;
    const address = 'someAddress'
    const origin = 'SomeOrigin';

    const tx = {
        type: 4,
        data: {
            assetId: 'WAVES',
            feeAssetId: 'WAVES',
            amount: 10000,
            fee: 1000,
            attachment: '',
            recipient: '3N3Cn2pYtqzj7N9pviSesNe8KG9Cmb718Y1'
        }
    }

    beforeEach(() => {
        controller = new MessageController({sign: async() => 'placeholder', broadcast: async () => 'broadcast placeholder'});
    });


    it('Should add new messages and generate correct metadata', () => {
        controller.newTx(tx, origin, address);
        controller.newTx(tx, origin, address);
        const state = controller.store.getState();
        expect(state.messages.length).to.eql(2);
        expect(state.messages[0].id).to.be.a('string');
        expect(state.messages[0].id).to.be.not.eql(state.messages[1].id);
        expect(state.messages[0].origin).to.eql(origin);
        expect(state.messages[0].account).to.eql(address);
        expect(state.messages[0].status).to.eql('unapproved');
        expect(state.messages[0].time).to.be.a('number');
        expect(state.messages[0].time).to.be.lt(Date.now());
    });

    it('Should approve message that has sender', async () => {
        const messagePromise = controller.newTx(tx, origin, address);
        const state = controller.store.getState();
        const msgId = state.messages[0].id;
        await controller.sign(msgId);
        expect(controller._getMessageById(msgId).status).to.eql('signed');
        const signedMessage = await messagePromise;
        expect(signedMessage).to.eql('placeholder');
    });

    it('Should approve message that don\'t have sender. Sender is passed as param', async () => {
        const messagePromise = controller.newTx(tx, origin);
        const state = controller.store.getState();
        const msgId = state.messages[0].id;
        await controller.sign(msgId, address);
        expect(controller._getMessageById(msgId).status).to.eql('signed');
        const signedMessage = await messagePromise;
        expect(signedMessage).to.eql('placeholder');
    });

    it('Shouldn\'t approve message that don\'t have sender. Sender not passed as param', async () => {
        controller.newTx(tx, origin).catch(()=>{});
        const state = controller.store.getState();
        const msgId = state.messages[0].id;
        let msg = ''
        try {
            await controller.sign(msgId);
        }catch (e) {
            msg = e.message
        }
        expect(msg).to.eql('Orphaned tx. No account public key')
    });

    it('Should approve and broadcast message if broadcast = true', async () => {
        const messagePromise = controller.newTx(tx, origin, address, true);
        const state = controller.store.getState();
        const msgId = state.messages[0].id;
        await controller.sign(msgId, address);
        expect(controller._getMessageById(msgId).status).to.eql('published');
        const signedMessage = await messagePromise;
        expect(signedMessage).to.eql('placeholder');
    });

    it('Should reject messages', async () => {
        const messagePromise = controller.newTx(tx, origin, address);
        const state = controller.store.getState();
        const msgId = state.messages[0].id;
        controller.reject(msgId);
        expect(controller._getMessageById(msgId).status).to.eql('rejected');
        let err;
        try {
            await messagePromise;
        } catch (e) {
            err = e
        }
        expect(err).to.be.a('Error');
        expect(err.message).to.eql('User denied message')
    });

});