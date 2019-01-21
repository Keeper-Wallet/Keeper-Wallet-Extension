import { CancelOrder } from './CancelOrder';
import { CancelOrderCard } from './CancelOrderCard';
import { CancelOrderFinal } from './CancelOrderFinal';
import { CancelOrderInfo } from './CancelOrderInfo';
import { getAmount, getAssetsId, getFee, messageType, isMe } from './parseTx';

const cancelOrder = {
    type: messageType,
    message: CancelOrder,
    card: CancelOrderCard,
    final: CancelOrderFinal,
    info: CancelOrderInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default cancelOrder;
