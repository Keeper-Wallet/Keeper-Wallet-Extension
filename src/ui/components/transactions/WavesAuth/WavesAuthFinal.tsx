import * as React from 'react';
import { TxStatus } from '../BaseTransaction';
import { useTranslation } from 'react-i18next';
import { MessageFinalComponentProps } from '../types';

export function WavesAuthFinal(props: MessageFinalComponentProps) {
  const { t } = useTranslation();

  return (
    <TxStatus
      {...props}
      messages={{
        send: t('sign.wavesAuthConfirmed'),
        approve: t('sign.wavesAuthConfirmed'),
        reject: t('sign.authRejected'),
      }}
    />
  );
}
