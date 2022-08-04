import * as React from 'react';
import { TxStatus } from '../BaseTransaction';
import { useTranslation } from 'react-i18next';
import { MessageFinalComponentProps } from '../types';

export function CustomDataFinal(props: MessageFinalComponentProps) {
  const { t } = useTranslation();

  return (
    <TxStatus
      {...props}
      messages={{
        send: t('sign.customDataSent'),
        approve: t('sign.customDataConfirmed'),
        reject: t('sign.customDataFailed'),
      }}
    />
  );
}
