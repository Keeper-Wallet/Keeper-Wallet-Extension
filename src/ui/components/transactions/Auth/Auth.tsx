import * as styles from './auth.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';

import { AuthCard } from './AuthCard';
import { AuthInfo } from './AuthInfo';
import { ApproveBtn, Button } from '../../ui';
import { TxHeader } from '../BaseTransaction';
import { SignWrapper } from '../../pages/importEmail/signWrapper';
import { useAppSelector } from 'ui/store';

export function Auth(props) {
  const status = useAppSelector(state => state.localState.transactionStatus);

  const { message, assets } = props;

  return (
    <div className={styles.transaction}>
      <TxHeader {...props} />

      <div className={`${styles.authTxScrollBox} transactionContent`}>
        <div className="margin-main">
          <AuthCard {...props} />
        </div>

        <AuthInfo message={message} assets={assets} />
      </div>

      <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
        <Button id="reject" onClick={props.reject} type="button" view="warning">
          <Trans i18nKey="sign.reject" />
        </Button>
        <SignWrapper onConfirm={props.approve}>
          {({ onPrepare, pending }) => (
            <ApproveBtn
              id="approve"
              type="submit"
              view="submit"
              loading={pending || status.approvePending}
              onClick={onPrepare}
            >
              <Trans i18nKey="sign.auth" />
            </ApproveBtn>
          )}
        </SignWrapper>
      </div>
    </div>
  );
}
