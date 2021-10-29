import { Burn } from './Burn';
import { BurnCard } from './BurnCard';
import { BurnFinal } from './BurnFinal';
import * as utils from './parseTx';

const burn = {
    type: utils.messageType,
    message: Burn,
    card: BurnCard,
    final: BurnFinal,
    ...utils,
};

export default burn;
