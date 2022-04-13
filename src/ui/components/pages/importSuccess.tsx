import * as styles from './importSuccess.module.css';
import cn from 'classnames';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { PAGES } from '../../pageConfig';
import { useAccountsSelector, useAppDispatch } from 'accounts/store';
import { setTab } from 'ui/actions';

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

      <p className="headline2 center margin-main-top margin-min">
        {t(
          !isKeystoreImport ? 'import.readyToUse' : 'import.readyToUseKeystore',
          { name: account.name }
        )}
      </p>

      <p className="body1 basic500 center">{t('import.readyHelpText')}</p>

      <div className={styles.footer}>
        {!isKeystoreImport && (
          <>
            <div className={`tag1 basic500 input-title`}>
              {t('newAccountName.accountAddress')}
            </div>

            <div className={`${styles.greyLine} grey-line`}>
              {account.address}
            </div>
          </>
        )}

        <Button
          data-testid="finishBtn"
          className="margin2"
          type="submit"
          view="submit"
          onClick={() => window.close()}
        >
          {t('import.finish')}
        </Button>

        <Button
          data-testid="addAnotherAccountBtn"
          className="margin1"
          type="button"
          onClick={() => dispatch(setTab(PAGES.ROOT))}
        >
          {t('import.addAnotherAccount')}
        </Button>
      </div>
    </div>
  );
}
