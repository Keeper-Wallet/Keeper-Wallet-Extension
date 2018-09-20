import {expect, assert} from 'chai';
import {NetworkController} from "../src/controllers";

describe('NetworkController', () => {
    require('isomorphic-fetch')

    let controller;

    beforeEach(()=>{
        controller =  new NetworkController()
    });

    it('Should set network', () => {
        controller.setNetwork('mainnet')
        expect(controller.getNetwork()).to.eql('mainnet')
    });

    it('Should set custom nodes', () => {
        controller.setCustomNode('https://testnet1.wavesnodes.com/')
        controller.setCustomNode('https://testnet1.wavesnodes.com/', 'testnet')
        expect(controller.getCustomNodes().testnet).to.eql('https://testnet1.wavesnodes.com/')
        expect(controller.getCustomNodes().mainnet).to.eql('https://testnet1.wavesnodes.com/')
    });
    it('Should broadcast transactions', async () => {
        const tx = {}
        const resp = await controller.broadcast(tx)
        expect(resp.message).to.eql('failed to parse json message')
        controller.setCustomNode('https://testnet1.wavesnodes.com/')
        const resp2 = await controller.broadcast(tx)
        expect(resp2.message).to.eql('failed to parse json message')
    });

});