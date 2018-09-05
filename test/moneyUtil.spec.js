import {expect, assert} from 'chai';
import {Money} from "@waves/data-entities";
import {moneylikeToMoney, moneyToMoneylike} from '../src/lib/moneyUtil';

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
        const money = moneylikeToMoney({assetId: 'WAVES', value: amountStr}, asset)
        expect(money.asset.id).to.eql('WAVES')
        expect(money.getCoins().toString()).to.eql(amountStr)
    })

    it('Should convert money to moneylike. Amount could be number or string', () => {
        const moneyFromNumber = new Money(amount, asset)
        const moneyFromStr = new Money(amountStr, asset)
        const moneylike1 = moneyToMoneylike(moneyFromNumber);
        const moneylike2 = moneyToMoneylike(moneyFromStr);
        expect(moneylike1).to.eql({assetId: 'WAVES', value: "15000"})
        expect(moneylike2).to.eql({assetId: 'WAVES', value: "15000"})
    })
});