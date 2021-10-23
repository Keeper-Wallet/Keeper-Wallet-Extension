import { Transfer } from './Transfer';
import { TransferCard } from './TransferCard';
import { TransferFinal } from './TransferFinal';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: Transfer,
    card: TransferCard,
    final: TransferFinal,
    ...utils,
};

export default transfer;
