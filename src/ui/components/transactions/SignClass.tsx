import * as React from 'react';
import { TransactionWallet } from '../wallets/TransactionWallet';
import { ComponentProps } from 'ui/components/transactions/BaseTransaction';

export class SignClass extends React.PureComponent<ComponentProps> {
  readonly props;
  readonly state = Object.create(null);

  render() {
    return (
      <div>
        <TransactionWallet
          account={this.props.selectedAccount}
          onSelect={this.props.selectAccount}
        />
      </div>
    );
  }
}
