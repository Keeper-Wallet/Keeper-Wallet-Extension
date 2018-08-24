import {expect, assert} from 'chai';
import {MessageController} from "../src/controllers";

describe("MessageController", () => {
    let controller;
    const address = 'SomeAddress';
    const origin = 'SomeOrigin';

    beforeEach(() => {
        controller = new MessageController({sign: async() => 'placeholder'});
    });


    it('Should add new messages and generate correct metadata', () => {
        controller.newMessage(address, origin, 'message');
        controller.newMessage(address, origin, 'message');
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

    it('Should sign message using sign method passed with options', async () => {
        const messagePromise = controller.newMessage(address, origin, 'message');
        const state = controller.store.getState();
        const msgId = state.messages[0].id;
        await controller.sign(msgId);
        expect(controller._getMessageById(msgId).status).to.eql('signed');
        const signedMessage = await messagePromise;
        expect(signedMessage).to.eql('placeholder');
    });

    it('Should reject messages', async () => {
        const messagePromise = controller.newMessage(address, origin, 'message');
        const state = controller.store.getState();
        const msgId = state.messages[0].id;
        controller.reject(msgId);
        expect(controller._getMessageById(msgId).status).to.eql('rejected');
        let err;
        try {
            await messagePromise;
        }catch (e) {
            err = e
        }
        expect(err).to.be.a('Error');
        expect(err.message).to.eql('User denied message')
    });

});