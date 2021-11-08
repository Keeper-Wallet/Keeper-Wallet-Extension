import { OriginAuth } from './OriginAuth';
import { OriginAuthCard } from './OriginAuthCard';
import { OriginAuthFinal } from './OriginAuthFinal';
import * as utils from './parseTx';

const originAuth = {
  type: utils.messageType,
  message: OriginAuth,
  card: OriginAuthCard,
  final: OriginAuthFinal,
  ...utils,
};

export default originAuth;
