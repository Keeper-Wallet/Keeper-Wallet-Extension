import * as React from 'react';
import * as styles from './SetScriptCardHeader.module.css';
import { useTranslation } from 'react-i18next';

import { TxIcon } from '../BaseTransaction';

interface IProps {
  script?: string;
}

const SetScriptCardHeader: React.FC<IProps> = ({ script }) => {
  const { t } = useTranslation();

  return script ? (
    <div className={styles.header}>
      <TxIcon className={styles.icon} txType="set-script" />
      <div>
        <div className={styles.data}>{t('transactions.dataTransaction')}</div>
        <h1 className={styles.title}>
          {t('transactions.setScriptTransaction')}
        </h1>
      </div>
    </div>
  ) : (
    <div className={styles.header}>
      <TxIcon className={styles.icon} txType="set-script-cancel" />
      <h1 className={styles.title}>
        {t('transactions.setScriptTransactionCancel')}
      </h1>
    </div>
  );
};

export default SetScriptCardHeader;
