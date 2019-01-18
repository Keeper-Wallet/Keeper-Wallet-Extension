import { Transfer } from './Transfer';
import { TransferCard } from './TransferCard';
import { TransferFinal } from './TransferFinal';
import { TransferInfo } from './TransferInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const alias = {
    type: messageType,
    message: Transfer,
    card: TransferCard,
    final: TransferFinal,
    info: TransferInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default alias;
