import { useTranslation } from 'react-i18next';

import { TxIcon } from '../BaseTransaction';
import * as styles from './SetScriptCardHeader.module.css';

interface Props {
  script?: string;
}

export const SetScriptCardHeader = ({ script }: Props) => {
  const { t } = useTranslation();

  return script ? (
    <div className={styles.header}>
      <TxIcon className={styles.icon} txType="set-script" />
      <div>
        <div className={styles.data}>{t('transactions.dataTransaction')}</div>
        <h1 className={styles.title} data-testid="setScriptTitle">
          {t('transactions.setScriptTransaction')}
        </h1>
      </div>
    </div>
  ) : (
    <div className={styles.header}>
      <TxIcon className={styles.icon} txType="set-script-cancel" />
      <h1 className={styles.title} data-testid="setScriptTitle">
        {t('transactions.setScriptTransactionCancel')}
      </h1>
    </div>
  );
};
