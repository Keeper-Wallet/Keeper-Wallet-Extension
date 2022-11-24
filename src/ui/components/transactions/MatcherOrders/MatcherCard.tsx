import cn from 'classnames';
import { PureComponent } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { TxIcon } from '../BaseTransaction';
import { MessageCardComponentProps } from '../types';
import * as styles from './matcher.styl';
import { messageType } from './parseTx';

class MatcherCardComponent extends PureComponent<
  MessageCardComponentProps & WithTranslation
> {
  render() {
    const { t, message, collapsed } = this.props;
    const { origin } = message;
    const className = cn(styles.matcherTransactionCard, this.props.className, {
      [styles.matcherCardCollapsed]: this.props.collapsed,
    });

    return (
      <div className={className}>
        <div>
          {collapsed ? (
            <>
              <div className={styles.smallCardContent}>
                <div className={styles.matcherTxIconSmall}>
                  <TxIcon txType={messageType} small />
                </div>
                <div>
                  <div className="basic500 body3 margin-min origin-ellipsis">
                    {origin}
                  </div>
                  <h1 className="headline1">
                    {t('transactions.signRequestMatcher')}
                  </h1>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.matcherTxIcon}>
              <TxIcon txType={messageType} />
            </div>
          )}
        </div>
        {collapsed ? null : <div className={styles.cardContent} />}
      </div>
    );
  }
}

export const MatcherCard = withTranslation()(MatcherCardComponent);
