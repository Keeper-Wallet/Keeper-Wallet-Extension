import { useAccountsSelector } from 'accounts/store/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const stateAccount = location.state?.account;
  const selectedAccount = useAccountsSelector(state => state.selectedAccount);
  const account = stateAccount || selectedAccount;

  return (
    <div data-testid="importSuccessForm" className={styles.content}>
      <div className={clsx(styles.successIcon, 'tx-approve-icon')} />

      <p className={clsx(styles.title, 'headline2')}>
        {t(
          isKeystoreImport ? 'import.readyToUseKeystore' : 'import.readyToUse',
          { name: account?.name || '' },
        )}
      </p>

      <p className={clsx(styles.description, 'body1 basic500')}>
        {t('import.readyHelpText')}
      </p>

      {!isKeystoreImport && account?.accountType === 'multichain' && (
        <>
          <div className={styles.addressLabel}>Account address:</div>
          <div className={styles.addressBox}>
            {account.address && (
              <div className={styles.addressLine}>
                <span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect width="12" height="12" rx="6" fill="white" />
                    <rect
                      x="1.05"
                      y="6"
                      width="7"
                      height="7"
                      transform="rotate(-45 1.05 6)"
                      fill="#1F5AF6"
                    />
                  </svg>
                </span>
                <span>{account.address}</span>
              </div>
            )}
            {account.addressEvm && (
              <div className={styles.addressLine}>
                <span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="6" fill="black" />
                    <path
                      d="M4.93359 6.00195H7.4668V8.53516H2.40039V3.46875H4.93359V6.00195ZM10 6.00195H7.4668V3.46875H10V6.00195Z"
                      fill="#9FE0C1"
                    />
                  </svg>
                </span>
                <span>{account.addressEvm}</span>
              </div>
            )}
          </div>
        </>
      )}
      {!isKeystoreImport && account?.accountType !== 'multichain' && (
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
