import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/components/ui/buttons/Button';
import { Error } from 'ui/components/ui/error';
import { ledgerService, LedgerServiceStatus } from './service';
import * as styles from './connectModal.module.css';

interface Props {
  networkCode: string;
  onClose: () => void;
  onReady: () => void;
}

export function LedgerConnectModal({ networkCode, onClose, onReady }: Props) {
  const { t } = useTranslation();

  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const connectToLedger = React.useCallback(async () => {
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
  }, [onReady]);

  React.useEffect(() => {
    return () => {
      if (ledgerService.status !== LedgerServiceStatus.Ready) {
        ledgerService.disconnect();
      }
    };
  }, []);

  React.useEffect(() => {
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

        <Error className={styles.error} show>
          {error}
        </Error>

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
