import * as styles from './invokeExpression.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { TxIcon } from '../BaseTransaction';
import cn from 'classnames';
import { ShowScript } from '../../ui';
import { messageType } from './parseTx';

interface Props {
  assets: any;
  className: string;
  collapsed: boolean;
  message: any;
}

export function InvokeExpressionCard({ className, message, collapsed }: Props) {
  const { data = {} } = message;
  const tx = { type: data.type, ...data.data };

  return (
    <div
      className={cn(styles.invokeExpressionTransactionCard, className, {
        [styles.invokeExpressionCard_collapsed]: collapsed,
      })}
    >
      <div className={styles.cardHeader}>
        <div className={styles.invokeExpressionTxIcon}>
          <TxIcon txType={messageType} />
        </div>
        <div>
          <div className="basic500 body3 margin-min">
            <Trans i18nKey="transactions.invokeExpression" />
          </div>
          <h1 className="headline1">
            <Trans i18nKey="transactions.invokeExpression" />
          </h1>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.txRow}>
          <div className="tx-title tag1 basic500">
            <Trans i18nKey="transactions.script" />
          </div>
          <div className={styles.txValue}>
            <ShowScript
              script={tx.expression}
              showNotify={true}
              optional={true}
              hideScript={collapsed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
