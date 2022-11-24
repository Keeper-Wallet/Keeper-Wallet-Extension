import { MessageConfig } from '../types';
import * as utils from './parseTx';
import { ScriptInvocation } from './ScriptInvocation';
import { ScriptInvocationCard } from './ScriptInvocationCard';
import { ScriptInvocationFinal } from './ScriptInvocationFinal';

const scriptInvocation: MessageConfig = {
  type: utils.messageType,
  message: ScriptInvocation,
  card: ScriptInvocationCard,
  final: ScriptInvocationFinal,
  ...utils,
};

export default scriptInvocation;
