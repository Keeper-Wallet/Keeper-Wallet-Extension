import { MassTransfer } from './MassTransfer';
import { MassTransferCard } from './MassTransferCard';
import { MassTransferFinal } from './MassTransferFinal';
import { MassTransferInfo } from './MassTransferInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const transfer = {
    type: messageType,
    message: MassTransfer,
    card: MassTransferCard,
    final: MassTransferFinal,
    info: MassTransferInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default transfer;
