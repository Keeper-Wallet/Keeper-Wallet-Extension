import { useTranslation } from 'react-i18next';

import { TxStatus } from '../BaseTransaction';
import { MessageFinalComponentProps } from '../types';

export function MatcherFinal(props: MessageFinalComponentProps) {
  const { t } = useTranslation();
  return (
    <TxStatus
      {...props}
      messages={{
        send: t('sign.matcherSend'),
        approve: t('sign.matcherConfirmed'),
        reject: t('sign.matcherRejected'),
      }}
    />
  );
}
