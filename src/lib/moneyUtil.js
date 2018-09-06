import {Money, BigNumber} from '@waves/data-entities';
import create from 'parse-json-bignumber';
const {stringify, parse} = create({BigNumber});

export function moneyFromJson(moneyJson, asset){
    const tokens = moneyJson.tokens;
    if (!tokens.match(/[0-9]+\.[0-9]+/)) throw new Error('Bad tokens string');
    const precision = tokens.length - tokens.indexOf('.') - 1
    const id = moneyJson.assetId
    const amount = tokens.replace('.', '')
    return new Money(amount, {precision, id})
}

// export function moneyToMoneylike(money){
//     return {
//         assetId: money.asset.id,
//         value: money.getCoins().toString()
//     }
// }