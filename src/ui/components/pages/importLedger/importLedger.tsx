import { ledgerService, LedgerServiceStatus } from 'ledger/service';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { newAccountSelect } from 'ui/actions/localState';
import { Button } from 'ui/components/ui/buttons/Button';
import { Error } from 'ui/components/ui/error';
import { PAGES } from 'ui/pageConfig';
import { useAppDispatch, useAppSelector } from 'ui/store';
import * as styles from './importLedger.module.css';

interface Props {
  setTab: (newTab: string) => void;
}

export function ImportLedger({ setTab }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(state => state.accounts);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const customCodes = useAppSelector(state => state.customCodes);
  const networks = useAppSelector(state => state.networks);

  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const networkCode =
    customCodes[currentNetwork] ||
    networks.find(n => currentNetwork === n.name).code;

  React.useEffect(() => {
    return () => {
      ledgerService.disconnect();
    };
  }, []);

  return (
    <div className={styles.root}>
      <h2 className={styles.title}>
        <Trans i18nKey="importLedger.title" />
      </h2>

      <p className={styles.instructions}>
        <Trans i18nKey="importLedger.instructions" />
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

          await ledgerService.connectUsb(networkCode);

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
            return;
          }

          const userData = await ledgerService.ledger.getUserDataById(0);

          if (accounts.some(acc => acc.address === userData.address)) {
            setError(t('importLedger.accountExistsError'));
            setIsConnecting(false);
            return;
          }

          dispatch(
            newAccountSelect({
              type: 'ledger',
              address: userData.address,
              id: userData.id,
              publicKey: userData.publicKey,
              name: '',
              hasBackup: true,
            })
          );

          setTab(PAGES.ACCOUNT_NAME);
        }}
      >
        <Trans i18nKey="importLedger.connectButton" />
      </Button>

      {isConnecting && <div className={styles.loader} />}
    </div>
  );
}
