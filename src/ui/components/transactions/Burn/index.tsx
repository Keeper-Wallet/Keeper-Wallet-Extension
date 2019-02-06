import { Burn } from './Burn';
import { BurnCard } from './BurnCard';
import { BurnFinal } from './BurnFinal';
import { BurnInfo } from './BurnInfo';
import * as utils from './parseTx';

const burn = {
    type: utils.messageType,
    message: Burn,
    card: BurnCard,
    final: BurnFinal,
    info: BurnInfo,
    ...utils,
};

export default burn;
