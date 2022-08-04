import * as styles from './assetScript.styl';
import * as React from 'react';
import { AssetScriptCard } from './AssetScriptCard';
import { TxDetailTabs, TxFooter, TxHeader, TxInfo } from '../BaseTransaction';
import { MessageComponentProps } from '../types';

export function AssetScript(props: MessageComponentProps) {
  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.assetScriptTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <AssetScriptCard {...props} />
        </div>

        <TxDetailTabs>
          <TxInfo />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
