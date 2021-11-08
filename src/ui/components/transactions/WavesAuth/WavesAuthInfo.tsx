import * as React from 'react';
import { Trans } from 'react-i18next';
import * as styles from './wavesAuth.styl';
import { DateFormat } from '../../ui';

interface IProps {
  message: any;
  assets: any;
}

export class WavesAuthInfo extends React.PureComponent<IProps> {
  render() {
    const { message } = this.props;
    const { messageHash, data } = message;

    return (
      <div>
        <div className={styles.txRow}>
          <div className="tx-title body3 basic500">
            <Trans i18nKey="transactions.wavesAuthTimeStamp" />
          </div>
          <div className={'fullwidth'}>
            <DateFormat
              value={data.timestamp}
              showRaw={true}
              className={'fullwidth'}
            />
          </div>
        </div>
        <div className={styles.txRow}>
          <div className="tx-title body3 basic500">
            <Trans i18nKey="transactions.publicKey" />
          </div>
          <div className={styles.txValue}>{data.publicKey}</div>
        </div>
        <div className={styles.txRow}>
          <div className="tx-title body3 basic500">
            <Trans i18nKey="transactions.dataHash" />
          </div>
          <div className={styles.txValue}>{messageHash}</div>
        </div>
      </div>
    );
  }
}
