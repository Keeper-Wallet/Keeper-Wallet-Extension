import * as styles from './invokeExpression.styl';
import * as React from 'react';

import { InvokeExpressionCard } from './invokeExpressionCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';

export function InvokeExpression(props) {
  const { sponsoredBalance } = props;
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div
        className={`${styles.invokeExpressionTxScrollBox} transactionContent`}
      >
        <div className="margin-main">
          <InvokeExpressionCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo sponsoredBalance={sponsoredBalance} />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
