import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { NetworkProfileSelector } from '../networkProfileSelector/networkProfileSelector';
import * as styles from './styles/settings.styl';

export function NetworkSettings() {
  const { t } = useTranslation();


  const [showCopied, setShowCopied] = useState(false);
  useEffect(() => {
    if (!showCopied) return;

    const timeout = setTimeout(() => {
      setShowCopied(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [showCopied]);

  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    if (!showSaved) return;

    const timeout = setTimeout(() => {
      setShowSaved(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [showSaved]);

  const [showSetDefault, setShowSetDefault] = useState(false);
  useEffect(() => {
    if (!showSetDefault) return;

    const timeout = setTimeout(() => {
      setShowSetDefault(false);
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [showSetDefault]);

  return (
    <div className={styles.networkTab}>
      <h2 className="title1 margin-main-big">
        {t('networksSettings.network')}
      </h2>

      <div className="margin-main-big">
        <NetworkProfileSelector className={styles.networkDropdown} />
      </div>
    </div>
  );
}
