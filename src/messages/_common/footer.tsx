import clsx from 'clsx';
import { usePopupSelector } from 'popup/store/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SignWrapper } from 'ui/components/pages/importEmail/signWrapper';
import * as transactionsStyles from 'ui/components/pages/styles/transactions.module.css';
import { ApproveBtn } from 'ui/components/ui/buttons/ApproveBtn';
import { Button } from 'ui/components/ui/buttons/Button';
import Background from 'ui/services/Background';

import { Message } from '../types';

interface Props {
  message: Message;
}

export function MessageFooter({ message }: Props) {
  const { t } = useTranslation();

  const autoClickProtection = usePopupSelector(
    state => state.uiState.autoClickProtection
  );

  const [isApprovePending, setIsApprovePending] = useState(false);
  const [isRejectPending, setIsRejectPending] = useState(false);

  return (
    <div
      className={clsx(transactionsStyles.txButtonsWrapper, 'buttons-wrapper')}
    >
      <Button
        data-testid="rejectButton"
        disabled={isApprovePending || isRejectPending}
        loading={isRejectPending}
        id="reject"
        type="button"
        view="warning"
        onClick={async () => {
          try {
            setIsRejectPending(true);
            await Background.reject(message.id);
            setIsRejectPending(false);
          } catch (err) {
            setIsRejectPending(false);
            throw err;
          }
        }}
      >
        {t('sign.reject')}
      </Button>

      <SignWrapper
        onConfirm={async () => {
          try {
            setIsApprovePending(true);
            await Background.approve(message.id);
            setIsApprovePending(false);
          } catch (err) {
            setIsApprovePending(false);

            const errorMessage =
              err && typeof err === 'object' && 'message' in err
                ? String(err.message)
                : String(err);

            if (
              message.origin &&
              (await Background.shouldIgnoreError(
                'contentScriptApprove',
                errorMessage
              ))
            )
              return;

            if (
              !message.origin &&
              (await Background.shouldIgnoreError('popupApprove', errorMessage))
            )
              return;

            throw err;
          }
        }}
      >
        {({ onPrepare, pending }) => (
          <ApproveBtn
            autoClickProtection={autoClickProtection}
            disabled={pending || isApprovePending || isRejectPending}
            id="approve"
            loading={pending || isApprovePending}
            type="submit"
            view="submit"
            onClick={onPrepare}
          >
            {t(
              message.type === 'auth'
                ? 'sign.auth'
                : 'broadcast' in message && message.broadcast
                ? 'sign.confirmButton'
                : 'sign.signButton'
            )}
          </ApproveBtn>
        )}
      </SignWrapper>
    </div>
  );
}
