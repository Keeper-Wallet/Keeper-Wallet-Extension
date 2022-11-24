import { MessageConfig } from '../types';
import * as utils from './parseTx';
import { WavesAuth } from './WavesAuth';
import { WavesAuthCard } from './WavesAuthCard';
import { WavesAuthFinal } from './WavesAuthFinal';

const wavesAuth: MessageConfig = {
  type: utils.messageType,
  message: WavesAuth,
  card: WavesAuthCard,
  final: WavesAuthFinal,
  ...utils,
};

export default wavesAuth;
