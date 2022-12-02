import clsx from 'clsx';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { getMoney } from '../../../utils/converters';
import { Balance } from '../../ui';
import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './burn.styl';
import { getAmount, messageType } from './parseTx';

class BurnCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const className = clsx(styles.burnTransactionCard, this.props.className, {
      [styles.burnCardCollapsed]: this.props.collapsed,
    });

    const { t, message, assets } = this.props;

    const { data } = message as Extract<
      typeof message,
      { type: 'transaction' }
    >;

    const tx = { type: data?.type, ...data?.data };
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
                data-testid="burnAmount"
                split
                addSign="-"
                showAsset
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
