import * as React from 'react';
import * as styles from './menu.styl';
import { HeadLogo } from '../head';
import { PAGES } from '../../pageConfig';
import { useNavigate } from 'ui/router';

interface Props {
  hasLogo: boolean | undefined;
  hasSettings: boolean | undefined;
  hasBack: boolean | undefined;
  hasClose: boolean | undefined;
}

export function Menu({ hasClose, hasBack, hasLogo, hasSettings }: Props) {
  const navigate = useNavigate();

  return (
    <div>
      {hasLogo && <HeadLogo />}

      {hasSettings && (
        <>
          <div
            className={styles.settingsIcon}
            onClick={() => {
              navigate(PAGES.SETTINGS);
            }}
          />

          <div
            className={styles.navigationIcon}
            onClick={() => {
              navigate(PAGES.INFO);
            }}
          />
        </>
      )}

      {hasBack && (
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
