import { ScriptInvocation } from './ScriptInvocation';
import { ScriptInvocationCard } from './ScriptInvocationCard';
import { ScriptInvocationFinal } from './ScriptInvocationFinal';
import * as utils from './parseTx';

const scriptInvocation = {
    type: utils.messageType,
    message: ScriptInvocation,
    card: ScriptInvocationCard,
    final: ScriptInvocationFinal,
    ...utils,
};

export default scriptInvocation;
