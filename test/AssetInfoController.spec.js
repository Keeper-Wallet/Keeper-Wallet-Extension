import {expect, assert} from 'chai';
import {AssetInfoController} from "../src/controllers";

describe('AssetInfoController', () => {
    require('isomorphic-fetch')

    const controller = new AssetInfoController({
        getNetwork: () => 'mainnet',
        getNode: () => 'https://nodes.wavesplatform.com'
    });

    it('Should Get waves asset info', async () => {
        const info = await controller.assetInfo('WAVES');
        //console.log(info)
        expect(info.description).to.eql('');
    });

    it('Should Get WBTC asset info', async () => {
        const info = await controller.assetInfo('8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS');
        //console.log(info)
        expect(info.description).to.eql('Bitcoin Token');
        expect(info.quantity).to.eql('2099999999916825');

    });

    it('Should return undefined on undefined asset id', async () => {
        const info = await controller.assetInfo('WAVES1');
        //console.log(info)
        expect(info).to.be.undefined
    });
});


