import { BigNumber } from '@waves/bignumber';
import clsx from 'clsx';
import { MessageFinal } from 'messages/_common/final';
import { MessageHeader } from 'messages/_common/header';
import { MessageIcon } from 'messages/_common/icon';
import { usePopupDispatch } from 'popup/store/react';
import { type PreferencesAccount } from 'preferences/types';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setShowNotification } from 'store/actions/notifications';
import { setAutoOrigin } from 'store/actions/permissions';
import invariant from 'tiny-invariant';
import Background from 'ui/services/Background';

import * as transactionsStyles from '../../ui/components/pages/styles/transactions.module.css';
import { ApproveBtn } from '../../ui/components/ui/buttons/ApproveBtn';
import { Button } from '../../ui/components/ui/buttons/Button';
import { DropdownButton } from '../../ui/components/ui/buttons/DropdownButton';
import { Input } from '../../ui/components/ui/input/Input';
import { Select } from '../../ui/components/ui/select/Select';
import { type MessageOfType } from '../types';
import * as styles from './authOrigin.module.css';

export function AuthOriginCard({
  className,
  collapsed,
  message,
}: {
  className?: string;
  collapsed?: boolean;
  message: MessageOfType<'authOrigin'>;
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx(transactionsStyles.transactionCard, className)}>
      {collapsed ? (
        <div className={styles.smallCardContent}>
          <MessageIcon className={styles.icon} type="authOrigin" small />

          <div>
            <div className={styles.origin}>{message.origin}</div>

            <h1 className={styles.title}>
              {t('transactions.allowAccessTitle')}
            </h1>
          </div>
        </div>
      ) : (
        <div className={transactionsStyles.txIconBig}>
          <MessageIcon type="authOrigin" />
        </div>
      )}
    </div>
  );
}

const INTERVAL_VALUES = {
  '0m': null,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '60m': 60 * 60 * 1000,
};

export function AuthOriginScreen({
  message,
  selectedAccount,
}: {
  message: MessageOfType<'authOrigin'>;
  selectedAccount: PreferencesAccount;
}) {
  const { t } = useTranslation();
  const dispatch = usePopupDispatch();

  const initialState: {
    interval: number | null;
    showNotify: boolean;
    totalAmount: string | null;
  } = { interval: null, showNotify: false, totalAmount: null };

  const [{ interval, showNotify, totalAmount }, setState] =
    useState(initialState);

  const [selectedResolutionTime, setSelectedResolutionSelected] =
    useState<keyof typeof INTERVAL_VALUES>('0m');

  const lastOriginRef = useRef(message.origin);

  if (message.origin !== lastOriginRef.current) {
    setSelectedResolutionSelected('0m');
    setState(initialState);
    lastOriginRef.current = message.origin;
  }

  const [isPending, setIsPending] = useState(false);

  return (
    <div className={transactionsStyles.transaction}>
      <MessageHeader message={message} selectedAccount={selectedAccount} />

      <div
        className={clsx(transactionsStyles.txScrollBox, 'transactionContent')}
      >
        <AuthOriginCard message={message} />

        <div className={styles.infoBlock}>
          <div
            className={clsx(styles.infoBlockIcon, 'inactive-account-icon')}
          />

          <div className={styles.infoBlockText}>{t('sign.signAccessInfo')}</div>
        </div>

        <details
          className={clsx(styles.permissionsDetails)}
          onToggle={event => {
            if (event.currentTarget.open) {
              event.currentTarget.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <summary className={styles.permissionsSummary}>
            {t('permissionSettings.modal.title')}
          </summary>

          <div className={styles.description}>
            {t('permissionSettings.modal.description', {
              originName: message.origin,
            })}
          </div>

          <Select
            className={styles.selectTime}
            description={t('permissionSettings.modal.time')}
            fill
            selectList={
              [
                {
                  id: '0m',
                  text: t('permissionSettings.modal.timeOff'),
                  value: '0m',
                },
                {
                  id: '15m',
                  text: t('permissionSettings.modal.time15m'),
                  value: '15m',
                },
                {
                  id: '30m',
                  text: t('permissionSettings.modal.time30m'),
                  value: '30m',
                },
                {
                  id: '60m',
                  text: t('permissionSettings.modal.time60m'),
                  value: '60m',
                },
              ] as const
            }
            selected={selectedResolutionTime}
            onSelectItem={(_, newValue) => {
              invariant(typeof newValue === 'string');
              setSelectedResolutionSelected(newValue);

              setState({
                totalAmount: newValue ? totalAmount : '',
                interval: INTERVAL_VALUES[newValue],
                showNotify,
              });
            }}
          />

          <div className={styles.amount}>
            <div className="left input-title basic500 tag1">
              {t('permissionSettings.modal.amount')}
            </div>

            <Input
              className={styles.amountInput}
              disabled={!interval}
              placeholder="0"
              value={(interval ? totalAmount : '') || ''}
              onChange={event => {
                const parsedValue = event.target.value
                  .replace(/[^0-9.]/g, '')
                  .split('.')
                  .slice(0, 2);

                if (parsedValue[1]) {
                  parsedValue[1] = parsedValue[1].slice(0, 8);
                }

                setState({
                  totalAmount: interval ? parsedValue.join('.') : '',
                  interval,
                  showNotify,
                });
              }}
            />

            <div className={styles.waves}>Waves</div>
          </div>

          <div className={styles.allowMessagesWrapper}>
            <Input
              checked={showNotify}
              id="checkbox_noshow"
              type="checkbox"
              onChange={event => {
                setState({
                  totalAmount: interval ? totalAmount : '',
                  interval,
                  showNotify: event.target.checked,
                });
              }}
            />

            <label htmlFor="checkbox_noshow">
              {t('notifications.allowSending')}
            </label>
          </div>
        </details>
      </div>

      <div
        className={clsx(transactionsStyles.txButtonsWrapper, 'buttons-wrapper')}
      >
        <DropdownButton placement="top">
          <Button
            id="reject"
            key="reject"
            type="button"
            view="warning"
            onClick={() => {
              Background.reject(message.id);
            }}
          >
            {t('sign.reject')}
          </Button>

          <Button
            className="custom"
            id="rejectForever"
            key="rejectForever"
            type="button"
            view="warning"
            onClick={() => {
              Background.reject(message.id, true);
            }}
          >
            {t('sign.blacklist')}
          </Button>
        </DropdownButton>

        <ApproveBtn
          disabled={isPending}
          id="approve"
          loading={isPending}
          type="button"
          view="submit"
          onClick={async () => {
            try {
              setIsPending(true);

              if (interval && totalAmount) {
                dispatch(
                  setAutoOrigin({
                    origin: message.origin,
                    params: {
                      interval,
                      totalAmount: new BigNumber(totalAmount)
                        .mul(10 ** 8)
                        .toFixed(8),
                      type: 'allowAutoSign',
                    },
                  }),
                );
              }

              if (showNotify) {
                dispatch(
                  setShowNotification({
                    canUse: showNotify,
                    origin: message.origin,
                  }),
                );
              }

              await Background.approve(message.id);
              setIsPending(false);
            } catch {
              setIsPending(false);
            }
          }}
        >
          {t('sign.auth')}
        </ApproveBtn>
      </div>
    </div>
  );
}

export function AuthOriginFinal({
  isApprove,
  isReject,
  isSend,
}: {
  isApprove: boolean;
  isReject: boolean;
  isSend: boolean | undefined;
}) {
  const { t } = useTranslation();

  return (
    <MessageFinal
      isApprove={isApprove}
      isReject={isReject}
      isSend={isSend}
      messages={{
        send: t('sign.authConfirmed'),
        approve: t('sign.authConfirmed'),
        reject: t('sign.authRejected'),
      }}
    />
  );
}
