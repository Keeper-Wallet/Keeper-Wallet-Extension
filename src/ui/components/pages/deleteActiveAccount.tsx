import * as styles from './deleteActiveAccount.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { deleteActiveAccount } from '../../actions/localState';
import { useAppDispatch } from 'ui/store';
import { navigate } from 'ui/router';
import { PAGES } from 'ui/pageConfig';

export function DeleteActiveAccount() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <div className={styles.content}>
      <h2 className="title1 margin2">{t('deleteAccount.attention')}</h2>
      <div className="margin4 body1">{t('deleteAccount.warn')}</div>
      <div>
        <Button
          id="deleteAccount"
          onClick={async () => {
            await dispatch(deleteActiveAccount());
            dispatch(navigate(PAGES.ROOT, { replace: true }));
          }}
          type="button"
          view="warning"
        >
          {t('deleteAccount.delete')}
        </Button>
      </div>
    </div>
  );
}
