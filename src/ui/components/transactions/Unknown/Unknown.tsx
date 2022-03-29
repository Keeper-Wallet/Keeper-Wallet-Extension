import * as styles from './unknown.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';

import { UnknownCard } from './UnknownCard';
import { UnknownInfo } from './UnknownInfo';
import { ApproveBtn, Button, ButtonType, ButtonView } from '../../ui';
import { TxHeader } from '../BaseTransaction';

export function Unknown(props) {
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
        <Button
          id="reject"
          onClick={props.reject}
          type={ButtonType.BUTTON}
          view={ButtonView.WARNING}
        >
          <Trans i18nKey="sign.reject" />
        </Button>
        <ApproveBtn
          id="approve"
          onClick={props.approve}
          type={ButtonType.SUBMIT}
          view={ButtonView.SUBMIT}
        >
          <Trans i18nKey="sign.auth" />
        </ApproveBtn>
      </div>
    </div>
  );
}
