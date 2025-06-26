import { usePopupDispatch, usePopupSelector } from 'popup/store/react';
import {
    isMultichainAccount,
    type PreferencesAccount,
} from 'preferences/types';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { deleteAccount } from '../../../store/actions/localState';
import { Button } from '../ui';
import * as styles from './deleteAccount.module.css';

export function DeleteAccount() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const params = useParams<{ address: string }>();
  const dispatch = usePopupDispatch();
  const location = useLocation();
  const allNetworksAccounts = usePopupSelector(
    state => state.allNetworksAccounts,
  );

  const isMultichain = location.search.includes('type=multichain');
  let deleteKey: string | undefined = params.address;
  if (isMultichain) {
    const acc = allNetworksAccounts.find(
      (x: PreferencesAccount) =>
        x.id === params.address && isMultichainAccount(x),
    );
    if (acc && isMultichainAccount(acc)) {
      deleteKey = acc.id;
    }
  }

  return (
    <div className={styles.content}>
      <h2 className="title1 margin2">{t('deleteAccount.attention')}</h2>
      <div className="margin4 body1">{t('deleteAccount.warn')}</div>
      <div>
        <Button
          id="deleteAccount"
          onClick={async () => {
            if (deleteKey) {
              await dispatch(deleteAccount(deleteKey));
            }
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
