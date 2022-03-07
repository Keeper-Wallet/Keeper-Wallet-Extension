import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ledgerSignRequestsClearAction } from 'ui/actions/ledger';
import { Button } from 'ui/components/ui/buttons/Button';
import { Error } from 'ui/components/ui/error';
import { Modal } from 'ui/components/ui/modal/Modal';
import { useAppSelector, useAppDispatch } from 'ui/store';
import { ledgerService, LedgerServiceStatus } from './service';
import * as styles from './signRequestModal.module.css';

export function LedgerSignRequestModal() {
  const { t } = useTranslation(undefined, { useSuspense: false });
  const dispatch = useAppDispatch();
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const customCodes = useAppSelector(state => state.customCodes);
  const networks = useAppSelector(state => state.networks);
  const ledgerSignRequests = useAppSelector(state => state.ledgerSignRequests);

  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [ledgerServiceStatus, setLedgerServiceStatus] = React.useState(
    ledgerService.status
  );

  return (
    <Modal
      showModal={
        ledgerSignRequests.length !== 0 &&
        ledgerServiceStatus !== LedgerServiceStatus.Ready
      }
    >
      <div className="modal cover">
        <div className="modal-form">
          <Button
            className="modal-close"
            onClick={() => {
              dispatch(ledgerSignRequestsClearAction());
            }}
            type="transparent"
          />

          <h1 className={styles.title}>
            <Trans i18nKey="ledgerSignRequestModal.title" />
          </h1>

          <p className={styles.instructions}>
            <Trans i18nKey="ledgerSignRequestModal.instructions" />
          </p>

          <Error className={styles.error} show>
            {error}
          </Error>

          <Button
            disabled={isConnecting}
            type="submit"
            onClick={async () => {
              setError(null);
              setIsConnecting(true);

              const networkCode =
                customCodes[currentNetwork] ||
                networks.find(n => currentNetwork === n.name).code;

              await ledgerService.connectUsb(networkCode);

              setLedgerServiceStatus(ledgerService.status);

              if (ledgerService.status !== LedgerServiceStatus.Ready) {
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
            }}
          >
            <Trans i18nKey="ledgerSignRequestModal.connectButton" />
          </Button>

          {isConnecting && <div className={styles.loader} />}
        </div>
      </div>
    </Modal>
  );
}
