import { useTranslation } from 'react-i18next';

interface Props {
  isApprove: boolean;
  isReject: boolean;
  isSend: boolean | undefined;
  messages?: { approve?: string; reject?: string; send?: string };
}

export function MessageFinal({
  isApprove,
  isReject,
  isSend,
  messages = {},
}: Props) {
  const { t } = useTranslation();

  const {
    approve = t('sign.transactionConfirmed'),
    reject = t('sign.transactionFailed'),
    send = t('sign.transactionSend'),
  } = messages;

  return isApprove ? (
    <div className="headline2 center">{isSend ? send : approve}</div>
  ) : isReject ? (
    <div className="headline2 center">{reject}</div>
  ) : null;
}
