import { MessageConfig } from '../types';
import { Auth } from './Auth';
import { AuthCard } from './AuthCard';
import { AuthFinal } from './AuthFinal';
import * as utils from './parseTx';

const auth: MessageConfig = {
  type: utils.messageType,
  message: Auth,
  card: AuthCard,
  final: AuthFinal,
  ...utils,
};

export default auth;
