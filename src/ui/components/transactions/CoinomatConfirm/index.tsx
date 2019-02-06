import { Coinomat } from './Coinomat';
import { CoinomatCard } from './CoinomatCard';
import { CoinomatFinal } from './CoinomatFinal';
import { CoinomatInfo } from './CoinomatInfo';
import * as utils from './parseTx';

const coinomat = {
    type: utils.messageType,
    message: Coinomat,
    card: CoinomatCard,
    final: CoinomatFinal,
    info: CoinomatInfo,
    ...utils,
};

export default coinomat;
