import * as React from 'react';
import { TransactionWallet } from '../wallets/TransactionWallet';

export class SignClass extends React.PureComponent {
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
