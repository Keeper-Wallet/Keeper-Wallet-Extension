import * as React from 'react';
import * as styles from './menu.styl';
import { HeadLogo } from '../head';
import { POPUP_PAGES } from '../../pages';
import { useNavigate } from 'ui/router';
import { useAccountsSelector } from 'accounts/store';

interface Props {
  hasLogo?: boolean;
  hasSettings?: boolean;
  hasBack?: boolean;
  hasClose?: boolean;
}

export function Menu({ hasClose, hasBack, hasLogo, hasSettings }: Props) {
  const navigate = useNavigate();

  const currentPage = useAccountsSelector(state => state.router.currentPage);

  return (
    <div>
      {hasLogo && <HeadLogo />}

      {hasSettings && (
        <>
          <div
            className={styles.settingsIcon}
            onClick={() => {
              navigate(POPUP_PAGES.SETTINGS);
            }}
          />

          <div
            className={styles.navigationIcon}
            onClick={() => {
              navigate(POPUP_PAGES.INFO);
            }}
          />
        </>
      )}

      {hasBack && currentPage !== window.location.hash.split('#')[1] && (
        <div
          className={`${styles.arrowBackIcon} arrow-back-icon`}
          onClick={() => {
            navigate(-1);
          }}
        />
      )}

      {hasClose && (
        <div
          className={`${styles.closeIcon} close-icon`}
          onClick={() => {
            navigate(-1);
          }}
        />
      )}
    </div>
  );
}
