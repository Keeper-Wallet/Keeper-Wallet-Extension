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

    it('Should convert amount and fee fields to Money instance', async () => {
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
        };
        const convertedTx = await controller.addAssetInfo(tx)

        expect(convertedTx.data.amount).to.be.a('Object')
        expect(convertedTx.data.fee).to.be.a('Object')
        expect(convertedTx.data.amount._coins.c[0]).to.eql(10000)
        expect(convertedTx.data.fee._coins.c[0]).to.eql(1000)
    });
});