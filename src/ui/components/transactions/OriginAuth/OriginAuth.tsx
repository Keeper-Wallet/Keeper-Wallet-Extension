import * as styles from './originAuth.styl';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';

import { OriginAuthCard } from './OriginAuthCard';
import { OriginAuthInfo } from './OriginAuthInfo';
import {
  ApproveBtn,
  Button,
  CollapsedContent,
  DropdownButton,
} from 'ui/components/ui';
import { ExtendedPermission } from 'ui/components/permissions';
import { connect } from 'react-redux';
import { BigNumber } from '@waves/bignumber';
import { TxHeader } from '../BaseTransaction';
import { AppState } from 'ui/store';
import { TAutoAuth } from 'ui/components/pages/PermissionsSettings/components';
import { MessageComponentProps } from '../types';
import { SignClass } from '../SignClass';

interface State extends Partial<TAutoAuth> {
  el?: HTMLDivElement | null;
  showNotify?: boolean | null;
}

class OriginAuthComponent extends SignClass<
  MessageComponentProps & WithTranslation,
  State
> {
  getRef = (el: HTMLDivElement | null) => this.setState({ el });

  render() {
    const { t, message, assets } = this.props;
    const title = (
      <span className={styles.collapsedTitle}>
        {t('permissionSettings.modal.title')}
      </span>
    );

    const { interval, type, totalAmount, showNotify } = this.state;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const bnAmount = new BigNumber(totalAmount!).mul(10 ** 8);
    const amount = bnAmount.isNaN() ? null : bnAmount.toFixed(8);
    const approvePermissions =
      !this.state.interval || !amount
        ? null
        : {
            origin: message.origin,
            params: { interval, totalAmount: amount, type },
          };
    const notifyPermissions = showNotify
      ? { canUse: showNotify, origin: message.origin }
      : null;
    const params = { notifyPermissions, approvePermissions };

    return (
      <div className={styles.transaction}>
        <TxHeader {...this.props} />

        <div
          className={`${styles.originAuthTxScrollBox} transactionContent`}
          ref={this.getRef}
        >
          <div className="margin-main">
            <OriginAuthCard {...this.props} />
          </div>

          <OriginAuthInfo message={message} assets={assets} />

          <CollapsedContent
            className={styles.collapsed}
            titleElement={title}
            scrollElement={this.state.el}
          >
            <ExtendedPermission
              originName={message.origin}
              autoSign={null}
              showNotify={false}
              onChangePerms={perms => this.setState(perms)}
            />
          </CollapsedContent>
        </div>

        <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
          <DropdownButton placement="top">
            <Button
              id="reject"
              key={'reject'}
              onClick={this.props.reject}
              type="button"
              view="warning"
            >
              {t('sign.reject')}
            </Button>
            <Button
              id="rejectForever"
              key={'rejectForever'}
              onClick={this.props.rejectForever}
              type="button"
              view="danger"
              className={'custom'}
            >
              {t('sign.blacklist')}
            </Button>
          </DropdownButton>
          <ApproveBtn
            id="approve"
            onClick={e => this.props.approve(e, params)}
            type="submit"
            view="submit"
          >
            {t('sign.auth')}
          </ApproveBtn>
        </div>
      </div>
    );
  }
}

const mapsToProps = (state: AppState) => ({
  origins: state.origins,
});

const actions = {};

export const OriginAuth = connect(
  mapsToProps,
  actions
)(withTranslation()(OriginAuthComponent));
