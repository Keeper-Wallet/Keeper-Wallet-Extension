import * as React from 'react';
import { TxStatus } from '../BaseTransaction';
import { useTranslation } from 'react-i18next';
import { MessageFinalComponentProps } from '../types';

export function OriginAuthFinal(props: MessageFinalComponentProps) {
  const { t } = useTranslation();

  return (
    <TxStatus
      {...props}
      messages={{
        send: t('sign.authConfirmed'),
        approve: t('sign.authConfirmed'),
        reject: t('sign.authRejected'),
      }}
    />
  );
}
