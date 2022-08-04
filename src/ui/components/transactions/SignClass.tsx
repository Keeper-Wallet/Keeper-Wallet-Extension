import * as React from 'react';
import { TransactionWallet } from '../wallets/TransactionWallet';

export class SignClass<
  TProps,
  TState = Record<never, unknown>
> extends React.PureComponent<TProps, TState> {
  state = Object.create(null);

  render() {
    return (
      <div>
        <TransactionWallet
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          account={(this.props as any).selectedAccount}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSelect={(this.props as any).selectAccount}
        />
      </div>
    );
  }
}
