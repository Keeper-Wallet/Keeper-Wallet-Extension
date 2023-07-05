import { useAccountsSelector } from 'accounts/store/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import background from 'ui/services/Background';

import { Button } from '../ui';
import * as styles from './importSuccess.module.css';

export function ImportSuccessAddressBook() {
  const { t } = useTranslation();

  return (
    <div data-testid="importSuccessForm" className={styles.content}>
      <div className={clsx(styles.successIcon, 'tx-approve-icon')} />

      <p className={clsx(styles.title, 'headline2')}>
        {t('import.readyToUseAddressBook')}
      </p>

      <p className={clsx(styles.description, 'body1 basic500')}>
        {t('import.readyAddressBookText')}
      </p>

      <div className={styles.footer}>
        <Button
          data-testid="finishBtn"
          className={styles.button}
          type="submit"
          view="submit"
          onClick={() => background.closeCurrentTab()}
        >
          {t('import.finish')}
        </Button>
      </div>
    </div>
  );
}

export function ImportSuccess({
  isKeystoreImport,
}: {
  isKeystoreImport?: boolean;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const account = useAccountsSelector(state => state.selectedAccount);

  return (
    <div data-testid="importSuccessForm" className={styles.content}>
      <div className={clsx(styles.successIcon, 'tx-approve-icon')} />

      <p className={clsx(styles.title, 'headline2')}>
        {t(
          isKeystoreImport ? 'import.readyToUseKeystore' : 'import.readyToUse',
          { name: account?.name },
        )}
      </p>

      <p className={clsx(styles.description, 'body1 basic500')}>
        {t('import.readyHelpText')}
      </p>

      {!isKeystoreImport && (
        <>
          <div className={`${styles.address} tag1 basic500 input-title`}>
            {t('newAccountName.accountAddress')}
          </div>

          <div className="grey-line">{account?.address}</div>
        </>
      )}

      <div className={styles.footer}>
        <Button
          data-testid="finishBtn"
          className={styles.button}
          type="submit"
          view="submit"
          onClick={() => background.closeCurrentTab()}
        >
          {t('import.finish')}
        </Button>

        <Button
          data-testid="addAnotherAccountBtn"
          className={styles.button}
          type="button"
          onClick={() => {
            navigate('/', { replace: true });
          }}
        >
          {t('import.addAnotherAccount')}
        </Button>
      </div>
    </div>
  );
}
