import * as styles from '../../pages/styles/transactions.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { ApproveBtn, Button, BUTTON_TYPE } from '../../ui';
import { SignWrapper } from '../../pages/importEmail/signWrapper';

export function TxFooter({
  message,
  approve,
  reject,
  hideApprove,
  autoClickProtection,
}) {
  const isSend = message.broadcast;

  return (
    <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
      <Button
        data-testid="rejectButton"
        id="reject"
        onClick={reject}
        type={BUTTON_TYPE.WARNING}
      >
        <Trans i18nKey="sign.reject" />
      </Button>

      {!hideApprove && (
        <SignWrapper onConfirm={approve}>
          {({ onPrepare, pending }) => (
            <ApproveBtn
              id="approve"
              onClick={onPrepare}
              type={BUTTON_TYPE.SUBMIT}
              loading={pending}
              disabled={pending}
              autoClickProtection={autoClickProtection}
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
