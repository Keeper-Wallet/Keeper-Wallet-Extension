import { BigNumber } from '@waves/bignumber';

export function convertInvokeListWorkAround(data) {
  // This workaround will not be needed once money-like-to-node starts
  // converting lists of integers here.
  // See https://github.com/wavesplatform/money-like-to-node/blob/939dbd5bfa132e6f77b4acbe9a08888cae642f4f/src/converters/index.ts#L127-L138
  if (data.type === 16 && data.call && data.call.args) {
    data.call.args.forEach(arg => {
      if (arg.type === 'list') {
        arg.value.forEach(item => {
          if (item.type === 'integer') {
            item.value = new BigNumber(item.value);
          }
        });
      }
    });
  }
}
