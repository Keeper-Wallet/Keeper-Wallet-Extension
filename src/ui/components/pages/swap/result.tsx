import { captureException, withScope } from '@sentry/browser';
import { Asset, Money } from '@waves/data-entities';
import clsx from 'clsx';
import { NetworkName } from 'networks/types';
import { usePopupSelector } from 'popup/store/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Balance } from 'ui/components/ui/balance/Balance';
import { Button } from 'ui/components/ui/buttons/Button';

import { NETWORK_CONFIG } from '../../../../constants';
import { SwapLayout } from './layout';
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
  [NetworkName.Mainnet]: 'wavesexplorer.com',
  [NetworkName.Testnet]: 'testnet.wavesexplorer.com',
  [NetworkName.Stagenet]: 'stagenet.wavesexplorer.com',
  [NetworkName.Custom]: undefined,
};

export function SwapResult({ fromMoney, transactionId, onClose }: Props) {
  const { t } = useTranslation();
  const assets = usePopupSelector(state => state.assets);
  const currentNetwork = usePopupSelector(state => state.currentNetwork);
  const selectedAccount = usePopupSelector(state => state.selectedAccount);

  const { nodeBaseUrl } = NETWORK_CONFIG[currentNetwork];

  const [swapStatus, setSwapStatus] = useState(SwapStatus.Pending);
  const [receivedMoney, setReceivedMoney] = useState<Money | null>(null);

  useEffect(() => {
    let cancelled = false;

    const txStatusUrl = new URL('/transactions/status', nodeBaseUrl);
    txStatusUrl.searchParams.set('id', transactionId);

    let timeout: number;
    let txInfoAttempts = 0;

    async function updateStatus(prevTxStatus: TxStatus | null) {
      const [txStatus] = (await fetch(txStatusUrl.toString()).then(res =>
        res.json(),
      )) as TxStatus[];

      if (cancelled) {
        return;
      }

      if (txStatus.status === 'confirmed') {
        if (txStatus.applicationStatus === 'succeeded') {
          const txInfoUrl = new URL(
            `/transactions/info/${transactionId}`,
            nodeBaseUrl,
          );

          try {
            const txInfo = (await fetch(txInfoUrl.toString()).then(res =>
              res.ok
                ? res.json()
                : res.text().then(text => Promise.reject(new Error(text))),
            )) as {
              stateChanges: {
                transfers: Array<{
                  address: string;
                  asset: string | null;
                  amount: number;
                }>;
              };
            };

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const transfer = txInfo.stateChanges.transfers.find(
              // eslint-disable-next-line @typescript-eslint/no-shadow
              t => t.address === selectedAccount?.address,
            )!;

            setReceivedMoney(
              new Money(
                transfer.amount,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                new Asset(assets[transfer.asset || 'WAVES']!),
              ),
            );
            setSwapStatus(SwapStatus.Succeeded);
          } catch (err) {
            txInfoAttempts++;

            if (txInfoAttempts < 5) {
              timeout = window.setTimeout(() => updateStatus(txStatus), 5000);
            } else {
              setSwapStatus(SwapStatus.Failed);

              withScope(scope => {
                scope.setExtra('transactionId', transactionId);
                captureException(err);
              });
            }
          }
        } else {
          setSwapStatus(SwapStatus.Failed);

          withScope(scope => {
            scope.setExtra('transactionId', transactionId);
            captureException(new Error('Swap transaction failed'));
          });
        }
      } else if (
        txStatus.status === 'not_found' &&
        prevTxStatus &&
        prevTxStatus.status === 'unconfirmed'
      ) {
        setSwapStatus(SwapStatus.Failed);

        withScope(scope => {
          scope.setExtra('transactionId', transactionId);
          captureException(new Error('Swap transaction failed'));
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccount?.address, nodeBaseUrl, transactionId]);

  const explorerBaseUrl = explorerBaseUrlsByNetwork[currentNetwork];

  return (
    <SwapLayout>
      <div className={styles.root}>
        <div className={styles.content}>
          <div className={styles.statusBox}>
            {swapStatus === SwapStatus.Pending ? (
              <>
                <div className={clsx(styles.statusIcon, 'tx-waiting-icon')} />

                <div className="margin-main-top margin-main-big headline2 center">
                  {t('swap.statusInProgress')}
                </div>
              </>
            ) : swapStatus === SwapStatus.Failed ? (
              <>
                <div className={clsx(styles.statusIcon, 'tx-reject-icon')} />

                <div className="margin-main-top margin-main-big headline2 center">
                  {t('swap.statusFailed')}
                </div>
              </>
            ) : (
              <>
                <div className={clsx(styles.statusIcon, 'tx-approve-icon')} />

                <div className="margin-main-top margin-main-big headline2 center">
                  {t('swap.statusSucceeded')}
                </div>
              </>
            )}
          </div>

          <div className={styles.main}>
            <div className={styles.card}>
              <div
                className={clsx(
                  styles.cardIcon,
                  'create-order-transaction-icon',
                )}
              />

              <div className={styles.cardText}>
                <Balance addSign="-" split showAsset balance={fromMoney} />

                {[SwapStatus.Pending, SwapStatus.Succeeded].includes(
                  swapStatus,
                ) && (
                  <Balance
                    addSign="+"
                    split
                    showAsset
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    balance={receivedMoney!}
                  />
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
                  {t('swap.viewTransaction')}
                </a>
              </div>
            )}
          </div>

          <Button type="button" onClick={onClose}>
            {t('swap.closeBtnText')}
          </Button>
        </div>
      </div>
    </SwapLayout>
  );
}
