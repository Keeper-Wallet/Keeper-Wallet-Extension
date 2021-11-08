import chai, { expect, assert } from 'chai';
import { NetworkController } from '../src/controllers';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.should();

describe('NetworkController', () => {
  require('isomorphic-fetch');

  let controller;

  beforeEach(() => {
    controller = new NetworkController();
  });

  it('Should set network', () => {
    controller.setNetwork('mainnet');
    expect(controller.getNetwork()).to.eql('mainnet');
  });

  it('Should set custom nodes', () => {
    controller.setCustomNode('https://nodes-stagenet.wavesnodes.com/');
    controller.setCustomNode(
      'https://nodes-stagenet.wavesnodes.com/',
      'stagenet'
    );
    expect(controller.getCustomNodes().stagenet).to.eql(
      'https://nodes-stagenet.wavesnodes.com/'
    );
    expect(controller.getCustomNodes().mainnet).to.eql(
      'https://nodes-stagenet.wavesnodes.com/'
    );
  });

  it('Should broadcast messages with transactions', async () => {
    const message = { type: 'transaction', data: {} };
    const resp = controller.broadcast(message);
    // Check for correct node error. That way we know request was correct
    return resp.should.eventually.be.rejectedWith(
      'failed to parse json message'
    );
  });

  it('Should broadcast messages with orders', async () => {
    const message = { type: 'order', data: {} };
    const resp = controller.broadcast(message);
    // Check for correct node error. That way we know request was correct
    return resp.should.eventually.be.rejectedWith(
      'failed to parse json message'
    );
  });

  it('Should broadcast messages with transactions to custom nodes', () => {
    const message = { type: 'transaction', data: {} };
    const resp = controller.broadcast(message);
    controller.setCustomNode('https://nodes-stagenet.wavesnodes.com/');
    return resp.should.eventually.be.rejectedWith(
      'failed to parse json message'
    );
  });
});
