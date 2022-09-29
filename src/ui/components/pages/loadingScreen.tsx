import * as styles from './styles/intro.styl';
import * as React from 'react';
import { BigLogo } from '../head';
import { ExportButton, ResetButton } from 'ui/components/ui';

const DEFAULT_TIMEOUT = 5000;

export function LoadingScreen() {
  const [showReset, setShowReset] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setShowReset(true);
    }, DEFAULT_TIMEOUT);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className={styles.intro}>
      <BigLogo />
      <div className={styles.loader}></div>

      {showReset && (
        <div className={styles.footer}>
          <ExportButton className={styles.exportButton} />
          <ResetButton className={styles.reset} />
        </div>
      )}
    </div>
  );
}
