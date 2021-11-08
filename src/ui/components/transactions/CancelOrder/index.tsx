import { CancelOrder } from './CancelOrder';
import { CancelOrderCard } from './CancelOrderCard';
import { CancelOrderFinal } from './CancelOrderFinal';
import * as utils from './parseTx';

const cancelOrder = {
  type: utils.messageType,
  message: CancelOrder,
  card: CancelOrderCard,
  final: CancelOrderFinal,
  ...utils,
};

export default cancelOrder;
