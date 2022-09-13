import * as React from 'react';
import * as styles from './menu.styl';
import { HeadLogo } from '../head';
import { PAGES } from '../../pageConfig';
import { useAppDispatch } from 'ui/store';
import { navigate } from 'ui/actions';

interface Props {
  hasLogo: boolean;
  hasSettings: boolean | undefined;
  hasBack: boolean;
  hasClose: boolean | undefined;
  onBack: () => void;
}

export function Menu({
  hasClose,
  hasBack,
  hasLogo,
  hasSettings,
  onBack,
}: Props) {
  const dispatch = useAppDispatch();

  return (
    <div>
      {hasLogo && <HeadLogo />}

      {hasSettings && (
        <>
          <div
            className={styles.settingsIcon}
            onClick={() => {
              dispatch(navigate(PAGES.SETTINGS));
            }}
          />

          <div
            className={styles.navigationIcon}
            onClick={() => {
              dispatch(navigate(PAGES.INFO));
            }}
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
