import * as React from 'react';
import * as styles from './importEmail.module.css';
import cn from 'classnames';

import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store';
import { Login } from './login';
import { newAccountSelect } from '../../../actions';
import { PageComponentProps, PAGES } from '../../../pageConfig';
import { IdentityUser } from 'controllers/IdentityController';

export function ImportEmail({ pushTab }: PageComponentProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.accounts);

  const handleSubmit = React.useCallback(
    userData => {
      if (
        accounts.find(
          account =>
            account.type === 'wx' && account.username === userData.username
        )
      ) {
        throw new Error(t('importEmail.alreadyExists'));
      }
    },
    [accounts, t]
  );

  const handleConfirm = React.useCallback(
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
        })
      );

      pushTab(PAGES.ACCOUNT_NAME_SEED);
    },
    [dispatch, pushTab]
  );

  return (
    <div className={styles.root}>
      <h2 className={cn('margin1', 'title1')}>
        {t('importEmail.importEmailTitle')}
      </h2>

      <p className="margin1 tag1 disabled500">
        {t('importEmail.importEmailDesc')}
      </p>

      <Login onSubmit={handleSubmit} onConfirm={handleConfirm} />
    </div>
  );
}
