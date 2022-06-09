import * as React from 'react';
import * as styles from './importEmail.module.css';
import cn from 'classnames';

import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store';
import { Login } from './login';
import { newAccountSelect } from '../../../actions';
import { PAGES } from '../../../pageConfig';

interface Props {
  setTab: (newTab: string) => void;
}

export function ImportEmail({ setTab }: Props) {
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
    userData => {
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

      setTab(PAGES.ACCOUNT_NAME_SEED);
    },
    [dispatch, setTab]
  );

  return (
    <div className={styles.root}>
      <h2 className={cn('margin1', 'title1')}>
        {t('importEmail.importEmailTitle')}
      </h2>

      <p className={cn(styles.centered, 'margin1', 'tag1', 'disabled500')}>
        {t('importEmail.importEmailDesc')}
      </p>

      <Login onSubmit={handleSubmit} onConfirm={handleConfirm} />
    </div>
  );
}
