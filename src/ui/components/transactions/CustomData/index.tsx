import { MessageConfig } from '../types';
import { CustomData } from './CustomData';
import { CustomDataCard } from './CustomDataCard';
import { CustomDataFinal } from './CustomDataFinal';
import * as utils from './parseTx';

const customData: MessageConfig = {
  type: utils.messageType,
  message: CustomData,
  card: CustomDataCard,
  final: CustomDataFinal,
  ...utils,
};

export default customData;
