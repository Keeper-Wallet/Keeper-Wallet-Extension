import { CreateOrder } from './CreateOrder';
import { CreateOrderCard } from './CreateOrderCard';
import { CreateOrderFinal } from './CreateOrderFinal';
import * as utils from './parseTx';

const transfer = {
    type: utils.messageType,
    message: CreateOrder,
    card: CreateOrderCard,
    final: CreateOrderFinal,
    ...utils,
};

export default transfer;
