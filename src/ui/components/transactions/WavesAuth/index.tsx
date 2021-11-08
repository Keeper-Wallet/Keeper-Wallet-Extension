import { WavesAuth } from './WavesAuth';
import { WavesAuthCard } from './WavesAuthCard';
import { WavesAuthFinal } from './WavesAuthFinal';
import * as utils from './parseTx';

const wavesAuth = {
  type: utils.messageType,
  message: WavesAuth,
  card: WavesAuthCard,
  final: WavesAuthFinal,
  ...utils,
};

export default wavesAuth;
