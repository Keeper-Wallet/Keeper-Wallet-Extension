import { ScriptInvocation } from './ScriptInvocation';
import { ScriptInvocationCard } from './ScriptInvocationCard';
import { ScriptInvocationFinal } from './ScriptInvocationFinal';
import * as utils from './parseTx';
import { MessageConfig } from '../types';

const scriptInvocation: MessageConfig = {
  type: utils.messageType,
  message: ScriptInvocation,
  card: ScriptInvocationCard,
  final: ScriptInvocationFinal,
  ...utils,
};

export default scriptInvocation;
