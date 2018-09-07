import {expect, assert} from 'chai';
import {Money} from "@waves/data-entities";
import {moneyFromJson} from '../src/lib/moneyUtil';

describe('moneyUtil', () => {
    const amount = 15000
    const amountStr = "15000"
    const asset = {
        "ticker": "WAVES",
        "id": "WAVES",
        "name": "Waves",
        "precision": 8,
        "description": "",
        "height": 0,
        "timestamp": "2016-04-11T21:00:00.000Z",
        "sender": "",
        "quantity": "10000000000000000",
        "reissuable": false
    }

    it('Should convert moneylike to money', () => {
        const money = moneyFromJson({assetId: 'WAVES', tokens: "0.00015000"})
        expect(money.asset.id).to.eql('WAVES')
        expect(money.getCoins().toString()).to.eql(amountStr)
        expect(money.toTokens().toString()).to.eql("0.00015000")
    })

    it('Should convert money to moneylike. Amount could be number or string', () => {
        const moneyFromNumber = new Money(amount, asset)
        const moneyFromStr = new Money(amountStr, asset)
        const moneylike1 = moneyFromNumber.toJSON()
        const moneylike2 = moneyFromStr.toJSON()
        expect(moneylike1).to.eql({assetId: 'WAVES', tokens: "0.00015000"})
        expect(moneylike2).to.eql({assetId: 'WAVES', tokens: "0.00015000"})
    })
});
