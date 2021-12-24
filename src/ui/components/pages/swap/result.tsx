import { Asset, Money } from '@waves/data-entities';
import cn from 'classnames';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button } from 'ui/components/ui/buttons/Button';
import { Balance } from 'ui/components/ui/balance/Balance';
import { useAppSelector } from 'ui/store';
import * as styles from './result.module.css';

interface Props {
  fromMoney: Money;
  transactionId: string;
  onClose: () => void;
}

enum SwapStatus {
  Pending,
  Succeeded,
  Failed,
}

type TxStatus =
  | { status: 'not_found'; id: string }
  | { status: 'unconfirmed'; id: string }
  | {
      status: 'confirmed';
      height: number;
      confirmations: number;
      applicationStatus: 'succeeded' | 'failed';
      spentComplexity: number;
      id: string;
    };

const explorerBaseUrlsByNetwork = {
  mainnet: 'wavesexplorer.com',
  testnet: 'testnet.wavesexplorer.com',
  stagenet: 'stagenet.wavesexplorer.com',
};

export function SwapResult({ fromMoney, transactionId, onClose }: Props) {
  const assets = useAppSelector(state => state.assets);
  const currentNetwork = useAppSelector(state => state.currentNetwork);
  const selectedAccount = useAppSelector(state => state.selectedAccount);

  const server = useAppSelector(
    state =>
      state.networks.find(net => net.name === state.currentNetwork).server
  );

  const [swapStatus, setSwapStatus] = React.useState(SwapStatus.Pending);
  const [receivedMoney, setReceivedMoney] = React.useState<Money | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const txStatusUrl = new URL('/transactions/status', server);
    txStatusUrl.searchParams.set('id', transactionId);

    let timeout: number;

    async function updateStatus(prevTxStatus: TxStatus) {
      const [txStatus] = (await fetch(txStatusUrl.toString()).then(res =>
        res.json()
      )) as TxStatus[];

      if (cancelled) {
        return;
      }

      if (txStatus.status === 'confirmed') {
        if (txStatus.applicationStatus === 'succeeded') {
          const txInfoUrl = new URL(
            `/transactions/info/${transactionId}`,
            server
          );

          const txInfo = (await fetch(txInfoUrl.toString()).then(res =>
            res.json()
          )) as {
            stateChanges: {
              transfers: Array<{
                address: string;
                asset: string | null;
                amount: number;
              }>;
            };
          };

          const transfer = txInfo.stateChanges.transfers.find(
            t => t.address === selectedAccount.address
          );

          setReceivedMoney(
            new Money(
              transfer.amount,
              new Asset(assets[transfer.asset || 'WAVES'])
            )
          );
          setSwapStatus(SwapStatus.Succeeded);
        } else {
          setSwapStatus(SwapStatus.Failed);
        }
      } else if (
        txStatus.status === 'not_found' &&
        prevTxStatus &&
        prevTxStatus.status === 'unconfirmed'
      ) {
        setSwapStatus(SwapStatus.Failed);
      } else {
        timeout = window.setTimeout(() => updateStatus(txStatus), 5000);
      }
    }

    updateStatus(null);

    return () => {
      cancelled = true;

      if (timeout != null) {
        window.clearTimeout(timeout);
      }
    };
  }, [selectedAccount.address, server, transactionId]);

  const explorerBaseUrl = explorerBaseUrlsByNetwork[currentNetwork];

  return (
    <div className={styles.root}>
      <div className={styles.statusBox}>
        {swapStatus === SwapStatus.Pending ? (
          <>
            <div className={cn(styles.statusIcon, 'tx-waiting-icon')} />

            <div className="margin-main-top margin-main-big headline2 center">
              <Trans i18nKey="swap.statusInProgress" />
            </div>
          </>
        ) : swapStatus === SwapStatus.Failed ? (
          <>
            <div className={cn(styles.statusIcon, 'tx-reject-icon')} />

            <div className="margin-main-top margin-main-big headline2 center">
              <Trans i18nKey="swap.statusFailed" />
            </div>
          </>
        ) : (
          <>
            <div className={cn(styles.statusIcon, 'tx-approve-icon')} />

            <div className="margin-main-top margin-main-big headline2 center">
              <Trans i18nKey="swap.statusSucceeded" />
            </div>
          </>
        )}
      </div>

      <div className={styles.main}>
        <div className={styles.card}>
          <div
            className={cn(styles.cardIcon, 'create-order-transaction-icon')}
          />

          <div className={styles.cardText}>
            <Balance addSign="-" split showAsset balance={fromMoney} />

            {[SwapStatus.Pending, SwapStatus.Succeeded].includes(
              swapStatus
            ) && (
              <Balance addSign="+" split showAsset balance={receivedMoney} />
            )}
          </div>
        </div>

        {explorerBaseUrl && (
          <div className="center margin-main-big-top">
            <a
              className="link black"
              href={`https://${explorerBaseUrl}/tx/${transactionId}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Trans i18nKey="swap.viewTransaction" />
            </a>
          </div>
        )}
      </div>

      <Button onClick={onClose}>
        <Trans i18nKey="swap.closeBtnText" />
      </Button>
    </div>
  );
}
