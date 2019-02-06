import { MassTransfer } from './MassTransfer';
import { MassTransferCard } from './MassTransferCard';
import { MassTransferFinal } from './MassTransferFinal';
import { MassTransferInfo } from './MassTransferInfo';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: MassTransfer,
    card: MassTransferCard,
    final: MassTransferFinal,
    info: MassTransferInfo,
        ...utils,
};

export default transfer;
