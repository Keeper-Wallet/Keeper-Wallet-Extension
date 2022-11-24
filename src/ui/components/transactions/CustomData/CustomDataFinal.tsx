import { useTranslation } from 'react-i18next';

import { TxStatus } from '../BaseTransaction';
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
