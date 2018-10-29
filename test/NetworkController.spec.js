import chai, {expect, assert} from 'chai';
import {NetworkController} from "../src/controllers";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);
chai.should();

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
        const resp =  controller.broadcast(tx)
        // Check for correct node error. That way we know request was correct
        return resp.should.eventually.be.rejectedWith('failed to parse json message')
    });

    it('Should broadcast transactions to custom nodes', () => {
        const tx = {}
        const resp =  controller.broadcast(tx)
        controller.setCustomNode('https://testnet1.wavesnodes.com/')
        return resp.should.eventually.be.rejectedWith('failed to parse json message')
    });
});