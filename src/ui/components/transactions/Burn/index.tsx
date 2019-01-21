import { Burn } from './Burn';
import { BurnCard } from './BurnCard';
import { BurnFinal } from './BurnFinal';
import { BurnInfo } from './BurnInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const burn = {
    type: messageType,
    message: Burn,
    card: BurnCard,
    final: BurnFinal,
    info: BurnInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default burn;
