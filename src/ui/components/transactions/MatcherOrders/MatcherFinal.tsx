import * as React from 'react';
import { TxStatus } from '../BaseTransaction';
import { useTranslation } from 'react-i18next';

export function MatcherFinal(props) {
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
