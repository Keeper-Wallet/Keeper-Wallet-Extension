import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './customData.styl';

interface IProps {
  message: any;
  assets: any;
}

export class CustomDataInfo extends React.PureComponent<IProps> {
  render() {
    const { message } = this.props;
    const { messageHash } = message;

    return (
      <div>
        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">
            <Trans i18nKey="transactions.txid" />
          </div>
          <div className={styles.txValue}>{messageHash}</div>
        </div>
      </div>
    );
  }
}
