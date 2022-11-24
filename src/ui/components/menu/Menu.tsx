import { useLocation, useNavigate } from 'react-router-dom';

import { HeadLogo } from '../head';
import * as styles from './menu.styl';

interface Props {
  hasLogo?: boolean;
  hasSettings?: boolean;
  hasBack?: boolean;
  hasClose?: boolean;
}

export function Menu({ hasClose, hasBack, hasLogo, hasSettings }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div>
      {hasLogo && <HeadLogo />}

      {hasSettings && (
        <>
          <div
            className={styles.settingsIcon}
            onClick={() => {
              navigate('/settings');
            }}
          />

          <div
            className={styles.navigationIcon}
            onClick={() => {
              navigate('/about');
            }}
          />
        </>
      )}

      {hasBack && location.pathname !== window.location.hash.split('#')[1] && (
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
