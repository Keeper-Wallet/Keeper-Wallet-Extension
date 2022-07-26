import * as React from 'react';
import { MessageComponentProps } from '../types';

export class UnknownInfo extends React.PureComponent<
  Pick<MessageComponentProps, 'message' | 'assets'>
> {
  render() {
    return <div />;
  }
}
