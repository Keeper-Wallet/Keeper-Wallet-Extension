import * as styles from './importSuccess.module.css';
import cn from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { PAGES } from '../../pageConfig';
import { useAccountsSelector, useAppDispatch } from 'accounts/store';
import { setTab } from 'ui/actions';

export function ImportSuccessAddressBook() {
  const { t } = useTranslation();

  return (
    <div data-testid="importSuccessForm" className={styles.content}>
      <div className={cn(styles.successIcon, 'tx-approve-icon')} />

      <p className={cn(styles.title, 'headline2')}>
        {t('import.readyToUseAddressBook')}
      </p>

      <p className={cn(styles.description, 'body1 basic500')}>
        {t('import.readyAddressBookText')}
      </p>

      <div className={styles.footer}>
        <Button
          data-testid="finishBtn"
          className={styles.button}
          type="submit"
          view="submit"
          onClick={() => window.close()}
        >
          {t('import.finish')}
        </Button>
      </div>
    </div>
  );
}

export function ImportSuccess() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const account = useAccountsSelector(state => state.selectedAccount);
  const isKeystoreImport = useAccountsSelector(
    state => state.backTabs.slice(-1)[0] === PAGES.IMPORT_KEYSTORE
  );

  return (
    <div data-testid="importSuccessForm" className={styles.content}>
      <div className={cn(styles.successIcon, 'tx-approve-icon')} />

      <p className={cn(styles.title, 'headline2')}>
        {t(
          isKeystoreImport ? 'import.readyToUse' : 'import.readyToUseKeystore',
          { name: account.name }
        )}
      </p>

      <p className={cn(styles.description, 'body1 basic500')}>
        {t('import.readyHelpText')}
      </p>

      {isKeystoreImport && (
        <>
          <div className={`${styles.address} tag1 basic500 input-title`}>
            {t('newAccountName.accountAddress')}
          </div>

          <div className="grey-line">{account.address}</div>
        </>
      )}

      <div className={styles.footer}>
        <Button
          data-testid="finishBtn"
          className={styles.button}
          type="submit"
          view="submit"
          onClick={() => window.close()}
        >
          {t('import.finish')}
        </Button>

        <Button
          data-testid="addAnotherAccountBtn"
          className={styles.button}
          type="button"
          onClick={() => dispatch(setTab(PAGES.ROOT))}
        >
          {t('import.addAnotherAccount')}
        </Button>
      </div>
    </div>
  );
}
