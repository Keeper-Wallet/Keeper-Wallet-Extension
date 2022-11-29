import { useEffect, useState } from 'react';
import { ExportButton, ResetButton } from 'ui/components/ui';

import { BigLogo } from '../head';
import * as styles from './loadingScreen.module.css';

export function LoadingScreen() {
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowReset(true);
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.logo}>
        <BigLogo />
      </div>

      {showReset && (
        <footer className={styles.footer}>
          <ExportButton className={styles.exportButton} />
          <ResetButton className={styles.resetButton} />
        </footer>
      )}
    </div>
  );
}
