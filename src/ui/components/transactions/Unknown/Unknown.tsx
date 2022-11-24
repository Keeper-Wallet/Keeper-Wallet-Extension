import { useTranslation } from 'react-i18next';

import { ApproveBtn, Button } from '../../ui';
import { TxHeader } from '../BaseTransaction';
import { MessageComponentProps } from '../types';
import * as styles from './unknown.styl';
import { UnknownCard } from './UnknownCard';
import { UnknownInfo } from './UnknownInfo';

export function Unknown(props: MessageComponentProps) {
  const { t } = useTranslation();

  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.unknownTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <UnknownCard {...props} />
        </div>

        <UnknownInfo message={message} assets={assets} />
      </div>

      <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
        <Button id="reject" onClick={props.reject} type="button" view="warning">
          {t('sign.reject')}
        </Button>
        <ApproveBtn
          id="approve"
          onClick={props.approve}
          type="submit"
          view="submit"
        >
          {t('sign.auth')}
        </ApproveBtn>
      </div>
    </div>
  );
}
