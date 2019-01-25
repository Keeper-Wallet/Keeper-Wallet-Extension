import { Transfer } from './Transfer';
import { TransferCard } from './TransferCard';
import { TransferFinal } from './TransferFinal';
import { TransferInfo } from './TransferInfo';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: Transfer,
    card: TransferCard,
    final: TransferFinal,
    info: TransferInfo,
    ...utils,
};

export default transfer;
