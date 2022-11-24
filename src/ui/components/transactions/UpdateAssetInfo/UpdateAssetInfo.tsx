import { TxDetailTabs, TxFooter, TxHeader } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './index.styl';
import { UpdateAssetInfoCard } from './UpdateAssetInfoCard';
import { UpdateAssetInfoInfo } from './UpdateAssetInfoInfo';

export function UpdateAssetInfo(props: MessageComponentProps) {
  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div
        className={`${styles.updateAssetInfoTxScrollBox} transactionContent`}
      >
        <div className="margin-main">
          <UpdateAssetInfoCard {...props} />
        </div>

        <TxDetailTabs>
          <UpdateAssetInfoInfo message={message} assets={assets} />
        </TxDetailTabs>
      </div>

      <TxFooter {...props} />
    </div>
  );
}
