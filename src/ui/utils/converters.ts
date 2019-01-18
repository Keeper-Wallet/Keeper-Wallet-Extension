import { BigNumber, Money } from '@waves/data-entities';

export const moneyLikeToMoney = (amount: IMoneyLike, assets): Money => {
    if (amount && amount.assetId ) {
        const ref = new Money(0, assets[amount.assetId]);
        
        if ('tokens' in amount) {
            return ref.cloneWithTokens(amount.tokens);
        }
        
        if ('coins' in amount) {
            return ref.cloneWithCoins(amount.coins);
        }
        
        return ref;
    }
};

export const getMoney = (amount: TAmount, assets) => {
    
    if (amount instanceof Money) {
        return amount;
    }
    
    if (amount instanceof BigNumber) {
        return new Money(amount, assets['WAVES']);
    }
    
    if (typeof amount === 'object' && amount && amount.assetId ) {
        return moneyLikeToMoney(amount as IMoneyLike, assets);
    }
    
    return new Money(new BigNumber(amount as string), assets['WAVES']);
};

type TAmount = IMoneyLike|BigNumber|Money|string|number;

interface IMoneyLike {
    coins?: number|string;
    tokens?: number|string;
    assetId: string;
}
