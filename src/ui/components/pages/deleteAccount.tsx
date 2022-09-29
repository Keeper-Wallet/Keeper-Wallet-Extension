import * as styles from './deleteAccount.module.css';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui';
import { deleteAccount } from '../../actions/localState';
import { useAppDispatch } from 'ui/store';

export function DeleteAccount() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const params = useParams<{ address: string }>();

  const dispatch = useAppDispatch();

  return (
    <div className={styles.content}>
      <h2 className="title1 margin2">{t('deleteAccount.attention')}</h2>
      <div className="margin4 body1">{t('deleteAccount.warn')}</div>
      <div>
        <Button
          id="deleteAccount"
          onClick={async () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            await dispatch(deleteAccount(params.address!));
            navigate('/', { replace: true });
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
