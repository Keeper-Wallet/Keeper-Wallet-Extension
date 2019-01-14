import chai, {expect, assert} from 'chai';
import chaiAsPromised from 'chai-as-promised'
import {MessageController, AssetInfoController} from "../src/controllers";

chai.use(chaiAsPromised);
chai.should();

describe("MessageController", () => {
    require('isomorphic-fetch');

    let controller;
    const account = {
        address: '3MxjhrvCr1nnDxvNJiCQfSC557gd8QYEhDx',
        publicKey: '9oRf59sSHE2inwF6wraJDPQNsx7ktMKxaKvyFFL8GDrh',
        networkCode: 'T'
    };

    const origin = 'SomeOrigin';

    const tx = {
        type: 4,
        successPath: 'https://wikipedia.org',
        data: {
            amount: {
                tokens: '1',
                assetId:'WAVES'
            },
            fee: {
                coins: '1000000',
                assetId:'WAVES'
            },
            attachment: '',
            recipient: '3N3Cn2pYtqzj7N9pviSesNe8KG9Cmb718Y1'
        }
    };

    const txPackage = [
        tx,
        tx,
        tx
    ];

    const auth =  {
        name: 'avcd',
        data: 'hello',
        successPath: 'https://www.wikipedia.org/wiki/Main_Page'
    };

    const matcherRequest = {
        type: 1001,
        data: {
            timestamp: Date.now()
        }
    };

    const coinomatRequest = {
        type: 1004,
        data: {
            timestamp: Date.now()
        }
    };

    const assetInfoController = new AssetInfoController({getNetwork:()=>'testnet', getNode:()=>'https://testnodes.wavesnodes.com'})

    beforeEach(() => {
        controller = new MessageController({signTx: async() => 'placeholder', broadcast: async () => 'broadcast placeholder', assetInfo: (id)=>assetInfoController.assetInfo(id)});
    });


    it('Should add correct messages to pipeline with correct metadata', async () => {
        await controller.newMessage(tx, 'transaction', origin, account);
        await controller.newMessage(txPackage, 'transactionPackage', origin, account);
        await controller.newMessage(auth, 'auth', origin, account);
        await controller.newMessage(matcherRequest, 'request', origin, account);
        await controller.newMessage(coinomatRequest, 'request', origin, account);
        const state = controller.store.getState();
        expect(state.messages.length).to.eql(5);
        expect(state.messages[0].id).to.be.a('string');
        expect(state.messages[0].id).to.be.not.eql(state.messages[1].id);
        expect(state.messages[0].origin).to.eql(origin);
        expect(state.messages[0].account).to.eql(account);
        expect(state.messages[0].status).to.eql('unapproved');
        expect(state.messages[0].timestamp).to.be.a('number');
        expect(state.messages[0].timestamp).to.be.lt(Date.now());
        expect(state.messages[1].data.length).to.eql(3)
    });


    it('Shouldn\'t add invalid messages to pipeline', ()=>{
        return controller.newMessage({}, 'transaction', origin, account).should.eventually.be.rejected;
    });

    it('Should approve message', async () => {
        const messageId = await controller.newMessage(tx, 'transaction', origin, account);
        const messageResultPromise = controller.getMessageResult(messageId);
        const state = controller.store.getState();
        const msgId = state.messages[0].id;
        await controller.approve(msgId);
        expect(controller._getMessageById(msgId).status).to.eql('signed');
        const signedMessage = await messageResultPromise;
        expect(signedMessage).to.eql('placeholder');
    });



    it('Should approve and broadcast message if broadcast = true', async () => {
        const messageId = await controller.newMessage(tx, 'transaction', origin, account, true);
        const messageResultPromise = controller.getMessageResult(messageId);
        await controller.approve(messageId);
        expect(controller._getMessageById(messageId).status).to.eql('published');
        const signedMessage = await messageResultPromise;
        expect(signedMessage).to.eql('broadcast placeholder');
    });

    it('Should reject messages', async () => {
        const messageId = await controller.newMessage(tx, 'transaction', origin, account);
        const messageResultPromise = controller.getMessageResult(messageId);
        controller.reject(messageId);

        return messageResultPromise.should.eventually.be.rejectedWith('User denied message')
    });

});