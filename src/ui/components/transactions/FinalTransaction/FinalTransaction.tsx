import { AssetsRecord } from 'assets/types';
import cn from 'classnames';
import { MessageStoreItem } from 'messages/types';
import { NotificationsStoreItem } from 'notifications/types';
import { PreferencesAccount } from 'preferences/types';
import { useTranslation } from 'react-i18next';
import { TransactionStatusState } from 'ui/reducers/localState';

import { Button } from '../../ui';
import { TxHeader } from '../BaseTransaction';
import * as orderParseTx from '../CreateOrder/parseTx';
import originAuth from '../OriginAuth';
import { MessageConfig } from '../types';
import * as styles from './final.styl';

interface Props {
  assets: AssetsRecord;
  config: MessageConfig;
  message: MessageStoreItem;
  messages: MessageStoreItem[];
  notifications: NotificationsStoreItem[][];
  selectedAccount: PreferencesAccount | undefined;
  transactionStatus: TransactionStatusState;
  onClose: () => void;
  onList: () => void;
  onNext: () => void;
}

export function FinalTransaction({
  assets,
  config,
  message,
  messages,
  notifications,
  selectedAccount,
  transactionStatus,
  onClose,
  onList,
  onNext,
}: Props) {
  const { t } = useTranslation();

  const otherMessagesCount = messages
    .map(item => item.id)
    .filter(id => id !== message.id).length;

  const isApprove = !!transactionStatus.approveOk;
  const isReject = !!transactionStatus.rejectOk;
  const isError = !!transactionStatus.approveError;
  const isShowNext = otherMessagesCount > 0;

  const isShowList =
    otherMessagesCount + notifications.length > 1 || notifications.length;

  const isShowClose = !isShowNext && !isShowList;
  const FinalComponent = config.final;
  const Card = config.card;
  const isOrder = orderParseTx.isMe(message.data, message.type);

  const networkCode = selectedAccount?.networkCode;

  const explorerUrls = new Map([
    ['W', 'wavesexplorer.com'],
    ['T', 'testnet.wavesexplorer.com'],
    ['S', 'stagenet.wavesexplorer.com'],
    ['custom', 'wavesexplorer.com/custom'],
  ]);

  const explorer = explorerUrls.get(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    explorerUrls.has(networkCode!) ? networkCode! : 'custom'
  );

  if (config.type === originAuth.type && !isShowClose) {
    if (isShowList) {
      onList();
    } else {
      onNext();
    }

    return null;
  }

  return (
    <div className={styles.transaction}>
      <TxHeader
        hideButton
        message={message}
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        selectedAccount={selectedAccount!}
      />

      <div className={cn(styles.finalTxScrollBox, 'transactionContent')}>
        {isReject || isApprove ? (
          <div
            className={cn(styles.txBigIcon, 'margin-main', {
              'tx-reject-icon': isReject,
              'tx-approve-icon': isApprove,
            })}
          />
        ) : null}

        <div className="margin-main-top margin-main-big">
          {isApprove || isReject ? (
            <div className="center">
              <FinalComponent
                isApprove={isApprove}
                isReject={isReject}
                isSend={message.broadcast}
                message={message}
                assets={assets}
              />
            </div>
          ) : null}

          {isError ? (
            <div className="headline2">
              <div className={`plate ${styles.finalTxPlate}`}>
                <div
                  className={`headline2Bold margin-main-big error-icon ${styles.finalTxTitle}`}
                >
                  {t('sign.someError')}
                </div>
                <div className={`body3 ${styles.finalTxPlate}`}>
                  {JSON.stringify(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (transactionStatus.approveError as any).error,
                    null,
                    4
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <Card message={message} assets={assets} collapsed={false} />

        {message.broadcast && isApprove && !isOrder && (
          <div className="center margin-main-big-top">
            <a
              rel="noopener noreferrer"
              className="link black"
              href={`https://${explorer}/tx/${message.messageHash}`}
              target="_blank"
            >
              {t('sign.viewTransaction')}
            </a>
          </div>
        )}

        {isOrder && (
          <div className={`${styles.txRow} margin-main-top`}>
            <div className="basic500 tx-title tag1">
              {t('transactions.orderId')}
            </div>
            <div className="black">{message.messageHash}</div>
          </div>
        )}
      </div>

      <div
        className={cn(styles.txButtonsWrapper, {
          'buttons-wrapper': isShowList && (isShowClose || isShowNext),
        })}
      >
        {isShowList ? (
          <Button
            type="button"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();

              onList();
            }}
          >
            {t('sign.pendingList')}
          </Button>
        ) : null}

        {isShowNext ? (
          <Button
            type="submit"
            view="submit"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();

              onNext();
            }}
          >
            {t('sign.nextTransaction')}
          </Button>
        ) : null}

        {isShowClose ? (
          <Button
            data-testid="closeTransaction"
            id="close"
            type="button"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();

              onClose();
            }}
          >
            {isError ? t('sign.understand') : null}
            {isReject || isApprove ? t('sign.close') : null}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
