import {expect, assert} from 'chai';
import {AssetInfoController} from "../src/controllers";

describe('AssetInfoController', () => {
    require('isomorphic-fetch')

    const controller = new AssetInfoController({
        getNetwork: () => 'mainnet',
        getNode: () => 'https://nodes.wavesnodes.com'
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
        expect(info.height).to.eql(257457);

    });

    it('Should throw on wrong asset id', async () => {
        try {
            const info = await controller.assetInfo('WAVES1');
            assert(false, 'Case didn\'t fail')
        }catch (e) {
            expect(e.message).to.eql('Could not find info for asset with id: WAVES1. Failed to find issue transaction by ID')
        }
    });
});


