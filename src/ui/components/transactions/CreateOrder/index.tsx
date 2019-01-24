import { CreateOrder } from './CreateOrder';
import { CreateOrderCard } from './CreateOrderCard';
import { CreateOrderFinal } from './CreateOrderFinal';
import { CreateOrderInfo } from './CreateOrderInfo';
import { getAmount, getPrice, getAssetsId, getFee, messageType, isMe } from './parseTx';

const transfer = {
    type: messageType,
    message: CreateOrder,
    card: CreateOrderCard,
    final: CreateOrderFinal,
    info: CreateOrderInfo,
    getAmount,
    getAssetsId,
    getFee,
    isMe,
};

export default transfer;
