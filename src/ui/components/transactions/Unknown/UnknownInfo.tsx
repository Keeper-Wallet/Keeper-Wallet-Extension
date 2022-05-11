import * as React from 'react';
import { ComponentProps } from 'ui/components/transactions/BaseTransaction';

export class UnknownInfo extends React.PureComponent<
  Pick<ComponentProps, 'message' | 'assets'>
> {
  render() {
    return <div />;
  }
}
