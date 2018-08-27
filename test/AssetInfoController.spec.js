import {expect, assert} from 'chai';
import {AssetInfoController} from "../src/controllers";

describe('AssetInfoController', () => {
    require('isomorphic-fetch')

    const controller = new AssetInfoController();
    it('Should Get asset info', async () => {
        const info = await controller.assetInfo('WAVES');
        const info2 = await controller.assetInfo('WAVES1');
        expect(info.description).to.eql('');
        expect(info2).to.be.null
    });

});