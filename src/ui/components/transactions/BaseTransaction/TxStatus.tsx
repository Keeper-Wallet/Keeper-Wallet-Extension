import { useTranslation } from 'react-i18next';

export function TxStatus({ isApprove, isReject, isSend, messages }: IProps) {
  const { t } = useTranslation();

  messages = {
    send: messages?.send || t('sign.transactionSend'),
    approve: messages?.approve || t('sign.transactionConfirmed'),
    reject: messages?.reject || t('sign.transactionFailed'),
  };

  if (isApprove) {
    return (
      <div className="headline2 center">
        {isSend ? messages.send : messages?.approve}
      </div>
    );
  }

  if (isReject) {
    return <div className="headline2 center">{messages?.reject}</div>;
  }

  return null;
}

interface IProps {
  isApprove: boolean;
  isReject: boolean;
  isSend: boolean | undefined;
  messages?: {
    approve?: string;
    reject?: string;
    send?: string;
  };
}
