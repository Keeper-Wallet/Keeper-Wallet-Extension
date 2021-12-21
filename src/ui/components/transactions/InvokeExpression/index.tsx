import { InvokeExpression } from './invokeExpression';
import { InvokeExpressionCard } from './invokeExpressionCard';
import { InvokeExpressionFinal } from './invokeExpressionFinal';
import * as utils from './parseTx';

const invokeExpression = {
  type: utils.messageType,
  message: InvokeExpression,
  card: InvokeExpressionCard,
  final: InvokeExpressionFinal,
  ...utils,
};

export default invokeExpression;
