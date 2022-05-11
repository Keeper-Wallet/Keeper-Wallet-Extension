import * as styles from './burn.styl';
import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { Balance } from '../../ui';
import { getMoney } from '../../../utils/converters';
import { getAmount, messageType } from './parseTx';

interface IProps extends WithTranslation {
  assets: any;
  className: string;
  collapsed: boolean;
  message: any;
}

class BurnCardComponent extends React.PureComponent<IProps> {
  render() {
    const className = cn(styles.burnTransactionCard, this.props.className, {
      [styles.burnCard_collapsed]: this.props.collapsed,
    });

    const { t, message, assets } = this.props;
    const { data = {} } = message;
    const tx = { type: data.type, ...data.data };
    const amount = getMoney(getAmount(tx), assets);

    return (
      <div className={className}>
        <div className={styles.cardHeader}>
          <div className={styles.burnTxIcon}>
            <TxIcon txType={messageType} />
          </div>
          <div>
            <div className="basic500 body3 margin-min">
              {t('transactions.burn')}
            </div>
            <h1 className="headline1">
              <Balance
                split={true}
                addSign="-"
                showAsset={true}
                balance={amount}
                showUsdAmount
              />
            </h1>
          </div>
        </div>

        <div className={styles.cardContent} />
      </div>
    );
  }
}

export const BurnCard = withTranslation()(BurnCardComponent);
