import * as React from 'react';
import { AssetDetail } from 'ui/services/Background';

interface IProps {
  message: any;
  assets: Record<string, AssetDetail>;
}

export class UnknownInfo extends React.PureComponent<IProps> {
  render() {
    return <div />;
  }
}
