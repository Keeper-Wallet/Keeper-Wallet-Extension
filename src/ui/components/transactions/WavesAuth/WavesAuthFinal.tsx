import * as React from 'react';
import { TxStatus } from '../BaseTransaction';
import { useTranslation } from 'react-i18next';

export function WavesAuthFinal(props) {
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
