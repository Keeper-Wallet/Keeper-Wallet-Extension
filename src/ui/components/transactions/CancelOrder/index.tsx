import { CancelOrder } from './CancelOrder';
import { CancelOrderCard } from './CancelOrderCard';
import { CancelOrderFinal } from './CancelOrderFinal';
import { CancelOrderInfo } from './CancelOrderInfo';
import * as utils from './parseTx';

const cancelOrder = {
    type: utils.messageType,
    message: CancelOrder,
    card: CancelOrderCard,
    final: CancelOrderFinal,
    info: CancelOrderInfo,
    ...utils,
};

export default cancelOrder;
