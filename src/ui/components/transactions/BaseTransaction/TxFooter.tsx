import * as styles from 'ui/components/pages/styles/transactions.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { ApproveBtn, Button, ButtonType, ButtonView } from 'ui/components/ui';
import { SignWrapper } from 'ui/components/pages/importEmail/signWrapper';
import { useAppSelector } from 'ui/store';

export function TxFooter({
  message,
  approve,
  reject,
  hideApprove,
  autoClickProtection,
}) {
  const status = useAppSelector(state => state.localState.transactionStatus);

  const isSend = message.broadcast;

  return (
    <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
      <Button
        data-testid="rejectButton"
        id="reject"
        onClick={reject}
        type={ButtonType.BUTTON}
        view={ButtonView.WARNING}
      >
        <Trans i18nKey="sign.reject" />
      </Button>
      {!hideApprove && (
        <SignWrapper onConfirm={approve}>
          {({ onPrepare, pending }) => (
            <ApproveBtn
              id="approve"
              type={ButtonType.SUBMIT}
              view={ButtonView.SUBMIT}
              loading={pending || status.approvePending}
              disabled={pending || status.approvePending}
              autoClickProtection={autoClickProtection}
              onClick={onPrepare}
            >
              <Trans
                i18nKey={isSend ? 'sign.confirmButton' : 'sign.signButton'}
              />
            </ApproveBtn>
          )}
        </SignWrapper>
      )}
    </div>
  );
}
