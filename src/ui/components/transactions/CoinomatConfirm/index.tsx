import { Coinomat } from './Coinomat';
import { CoinomatCard } from './CoinomatCard';
import { CoinomatFinal } from './CoinomatFinal';
import { CoinomatInfo } from './CoinomatInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const coinomat = {
    type: messageType,
    message: Coinomat,
    card: CoinomatCard,
    final: CoinomatFinal,
    info: CoinomatInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe
};

export default coinomat;
