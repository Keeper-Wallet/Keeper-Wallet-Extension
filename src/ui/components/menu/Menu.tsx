import * as React from 'react';
import * as styles from './menu.styl';
import { HeadLogo } from '../head';
import { PAGES } from '../../pageConfig';

interface Props {
  hasLogo: boolean;
  hasSettings: boolean | undefined;
  hasBack: boolean;
  hasClose: boolean | undefined;
  pushTab: (tab: string) => void;
  onBack: () => void;
}

export function Menu({
  hasClose,
  hasBack,
  hasLogo,
  hasSettings,
  pushTab,
  onBack,
}: Props) {
  return (
    <div>
      {hasLogo && <HeadLogo />}

      {hasSettings && (
        <>
          <div
            className={styles.settingsIcon}
            onClick={() => pushTab(PAGES.SETTINGS)}
          />

          <div
            className={styles.navigationIcon}
            onClick={() => pushTab(PAGES.INFO)}
          />
        </>
      )}

      {hasBack && (
        <div
          className={`${styles.arrowBackIcon} arrow-back-icon`}
          onClick={onBack}
        />
      )}

      {hasClose && (
        <div className={`${styles.closeIcon} close-icon`} onClick={onBack} />
      )}
    </div>
  );
}
