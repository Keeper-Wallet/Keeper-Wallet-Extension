import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui/buttons/Button';
import { ErrorMessage } from 'ui/components/ui/error';

import * as styles from './connectModal.module.css';
import { ledgerService, LedgerServiceStatus } from './service';

interface Props {
  networkCode: string;
  onClose: () => void;
  onReady: () => void;
}

export function LedgerConnectModal({ networkCode, onClose, onReady }: Props) {
  const { t } = useTranslation();

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectToLedger = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    await ledgerService.connectUsb(networkCode);

    if (ledgerService.status === LedgerServiceStatus.Ready) {
      onReady();
    } else {
      switch (ledgerService.status) {
        case LedgerServiceStatus.UsedBySomeOtherApp:
          setError(t('ledgerErrors.usedBySomeOtherApp'));
          break;
        default:
          setError(t('ledgerErrors.unknown'));
          break;
      }

      setIsConnecting(false);
    }
  }, [networkCode, onReady, t]);

  useEffect(() => {
    return () => {
      if (ledgerService.status !== LedgerServiceStatus.Ready) {
        ledgerService.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    connectToLedger();
  }, [connectToLedger]);

  return (
    <div className="modal cover">
      <div className="modal-form">
        <Button
          className="modal-close"
          onClick={() => {
            onClose();
          }}
          view="transparent"
        />

        <h1 className={styles.title}>{t('ledgerConnectModal.title')}</h1>

        <p className={styles.instructions}>
          {t('ledgerConnectModal.instructions')}
        </p>

        <ErrorMessage className={styles.error} show>
          {error}
        </ErrorMessage>

        {isConnecting ? (
          <div className={styles.loader} />
        ) : (
          <Button
            disabled={isConnecting}
            view="submit"
            onClick={connectToLedger}
          >
            {t('ledgerConnectModal.tryAgainButton')}
          </Button>
        )}
      </div>
    </div>
  );
}
