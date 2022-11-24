import { PureComponent } from 'react';

import { MessageComponentProps } from '../types';

export class UnknownInfo extends PureComponent<
  Pick<MessageComponentProps, 'message' | 'assets'>
> {
  render() {
    return <div />;
  }
}
