import * as styles from './customData.styl';
import * as React from 'react';

import { CustomDataCard } from './CustomDataCard';
import { CustomDataInfo } from './CustomDataInfo';
import { ComponentProps, TxFooter, TxHeader } from '../BaseTransaction';

export function CustomData(props: ComponentProps) {
  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.dataTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <CustomDataCard {...props} />
        </div>

        <CustomDataInfo message={message} assets={assets} />
      </div>

      <TxFooter {...props} />
    </div>
  );
}
