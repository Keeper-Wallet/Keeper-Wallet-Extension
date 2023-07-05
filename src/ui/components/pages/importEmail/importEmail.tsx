import clsx from 'clsx';
import type { IdentityUser } from 'controllers/IdentityController';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  usePopupDispatch,
  usePopupSelector,
} from '../../../../popup/store/react';
import { newAccountSelect } from '../../../../store/actions/localState';
import * as styles from './importEmail.module.css';
import { Login, type UserData } from './login';

export function ImportEmail() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();
  const accounts = usePopupSelector(state => state.accounts);

  const handleSubmit = useCallback(
    (userData: UserData) => {
      if (
        accounts.find(
          account =>
            account.type === 'wx' && account.username === userData.username,
        )
      ) {
        throw new Error(t('importEmail.alreadyExists'));
      }
    },
    [accounts, t],
  );

  const handleConfirm = useCallback(
    (userData: IdentityUser & { name: string }) => {
      dispatch(
        newAccountSelect({
          type: 'wx',
          name: userData.name,
          address: userData.address,
          publicKey: userData.publicKey,
          uuid: userData.uuid,
          username: userData.username,
          hasBackup: true,
        }),
      );

      navigate('/account-name');
    },
    [dispatch, navigate],
  );

  return (
    <div className={styles.root}>
      <h2 className={clsx('margin1', 'title1')}>
        {t('importEmail.importEmailTitle')}
      </h2>

      <p className="margin1 tag1 disabled500">
        {t('importEmail.importEmailDesc')}
      </p>

      <Login onSubmit={handleSubmit} onConfirm={handleConfirm} />
    </div>
  );
}
