import { ScriptInvocation } from './ScriptInvocation';
import { ScriptInvocationCard } from './ScriptInvocationCard';
import { ScriptInvocationFinal } from './ScriptInvocationFinal';
import { ScriptInvocationInfo } from './ScriptInvocationInfo';
import * as utils from './parseTx';

const scriptInvocation = {
    type: utils.messageType,
    message: ScriptInvocation,
    card: ScriptInvocationCard,
    final: ScriptInvocationFinal,
    info: ScriptInvocationInfo,
        ...utils,
};

export default scriptInvocation;
