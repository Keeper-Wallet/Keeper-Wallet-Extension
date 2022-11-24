import { useTranslation } from 'react-i18next';
import { SignWrapper } from 'ui/components/pages/importEmail/signWrapper';
import * as styles from 'ui/components/pages/styles/transactions.styl';
import { ApproveBtn, Button } from 'ui/components/ui';
import { useAppSelector } from 'ui/store';

import { MessageComponentProps } from '../types';

export function TxFooter({
  message,
  approve,
  reject,
  hideApprove,
  autoClickProtection,
}: MessageComponentProps & { hideApprove?: boolean }) {
  const { t } = useTranslation();
  const status = useAppSelector(state => state.localState.transactionStatus);

  const isSend = message.broadcast;

  return (
    <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
      <Button
        data-testid="rejectButton"
        id="reject"
        onClick={reject}
        type="button"
        view="warning"
      >
        {t('sign.reject')}
      </Button>
      {!hideApprove && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <SignWrapper onConfirm={approve as any}>
          {({ onPrepare, pending }) => (
            <ApproveBtn
              id="approve"
              type="submit"
              view="submit"
              loading={pending || status.approvePending}
              disabled={pending || status.approvePending}
              autoClickProtection={autoClickProtection}
              onClick={onPrepare}
            >
              {t(isSend ? 'sign.confirmButton' : 'sign.signButton')}
            </ApproveBtn>
          )}
        </SignWrapper>
      )}
    </div>
  );
}
