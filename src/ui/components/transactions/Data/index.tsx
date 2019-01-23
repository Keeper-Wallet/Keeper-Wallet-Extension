import { Data } from './Data';
import { DataCard } from './DataCard';
import { DataFinal } from './DataFinal';
import { DataInfo } from './DataInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const transfer = {
    type: messageType,
    message: Data,
    card: DataCard,
    final: DataFinal,
    info: DataInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default transfer;
