import { Auth } from './Auth';
import { AuthCard } from './AuthCard';
import { AuthFinal } from './AuthFinal';
import * as utils from './parseTx';

const auth = {
  type: utils.messageType,
  message: Auth,
  card: AuthCard,
  final: AuthFinal,
  ...utils,
};

export default auth;
