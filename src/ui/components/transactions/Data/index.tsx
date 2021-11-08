import { Data } from './Data';
import { DataCard } from './DataCard';
import { DataFinal } from './DataFinal';
import * as utils from './parseTx';

const transfer = {
  type: utils.messageType,
  message: Data,
  card: DataCard,
  final: DataFinal,
  ...utils,
};

export default transfer;
