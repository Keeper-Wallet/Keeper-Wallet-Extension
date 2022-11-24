import { TxFooter, TxHeader } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './customData.styl';
import { CustomDataCard } from './CustomDataCard';
import { CustomDataInfo } from './CustomDataInfo';

export function CustomData(props: MessageComponentProps) {
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
