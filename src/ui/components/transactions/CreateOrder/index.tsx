import { MessageConfig } from '../types';
import { CreateOrder } from './CreateOrder';
import { CreateOrderCard } from './CreateOrderCard';
import { CreateOrderFinal } from './CreateOrderFinal';
import * as utils from './parseTx';

const createOrder: MessageConfig = {
  type: utils.messageType,
  message: CreateOrder,
  card: CreateOrderCard,
  final: CreateOrderFinal,
  ...utils,
};

export default createOrder;
