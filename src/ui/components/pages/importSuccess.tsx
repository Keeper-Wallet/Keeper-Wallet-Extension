import * as styles from './importSuccess.module.css';
import cn from 'classnames';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { Button } from '../ui';
import { PAGES } from '../../pageConfig';
import * as libCrypto from '@waves/ts-lib-crypto';
import { useAppDispatch, useAppSelector } from 'accounts/store';
import { setTab } from 'ui/actions';

export function ImportSuccess() {
  const dispatch = useAppDispatch();
  const account = useAppSelector(state => state.localState.newAccount);
  const networkCode = useAppSelector(
    state =>
      state.customCodes[state.currentNetwork] ||
      state.networks.find(n => state.currentNetwork === n.name).code
  );

  const accountAddress =
    account.address || libCrypto.address(account.seed, networkCode);

  return (
    <div className={styles.content}>
      <div className={cn(styles.successIcon, 'tx-approve-icon')} />

      <p className="headline2 center margin-main-big-top margin-main-large">
        <Trans
          i18nKey="import.additionSuccess"
          values={{ name: account.name }}
        />
      </p>

      <div className={styles.footer}>
        <div className={`tag1 basic500 input-title`}>
          <Trans i18nKey="newAccountName.accountAddress" />
        </div>

        <div className={`${styles.greyLine} grey-line`}>{accountAddress}</div>

        <Button
          className="margin2"
          type="submit"
          onClick={() => dispatch(setTab(PAGES.ROOT))}
        >
          <Trans i18nKey="import.addAnotherAccount" />
        </Button>

        <Button
          className="margin1"
          type="button"
          onClick={() => window.close()}
        >
          <Trans i18nKey="import.close" />
        </Button>
      </div>
    </div>
  );
}
