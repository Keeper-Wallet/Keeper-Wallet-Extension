import { Money } from '@waves/data-entities';
import { BigNumber } from '@waves/bignumber';

export const moneyLikeToMoney = (amount: IMoneyLike, assets): Money => {
    if (amount) {
        let amountResult = new Money(0, assets[amount.assetId || 'WAVES']);

        if ('tokens' in amount) {
            amountResult = amountResult.cloneWithTokens(amount.tokens || 0);
        }
        
        if ('coins' in amount) {
            amountResult = amountResult.add(amountResult.cloneWithCoins(amount.coins || 0));
        }
        
        return amountResult;
    }
};

export const getMoney = (amount: TAmount, assets) => {
    
    if (amount instanceof Money) {
        return amount;
    }
    
    if (amount instanceof BigNumber) {
        return new Money(amount, assets['WAVES']);
    }
    
    if (typeof amount === 'object' && (amount.tokens || amount.coins) ) {
        return moneyLikeToMoney(amount as IMoneyLike, assets);
    }
    
    return new Money(new BigNumber(amount as string), assets['WAVES']);
};

type TAmount = IMoneyLike|BigNumber|Money|string|number;

interface IMoneyLike {
    coins?: number|string|BigNumber;
    tokens?: number|string|BigNumber;
    assetId: string;
}

