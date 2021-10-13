import * as styles from './originAuth.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { OriginAuthCard } from './OriginAuthCard';
import { OriginAuthInfo } from './OriginAuthInfo';
import { TransactionWallet } from '../../wallets';
import { ApproveBtn, Button, BUTTON_TYPE, CollapsedContent, DropdownButton } from 'ui/components/ui';
import { ExtendedPermission } from 'ui/components/permissions';
import { connect } from 'react-redux';
import { BigNumber } from '@waves/bignumber';

class OriginAuthComponent extends SignClass {
    getRef = (el) => this.setState({ el });

    render() {
        const { message, assets } = this.props;
        const title = (
            <span className={styles.collapsedTitle}>
                <Trans i18nKey="permissionSettings.modal.title">Permission details</Trans>
            </span>
        );

        const { interval, type, totalAmount, showNotify } = this.state;
        const bnAmount = new BigNumber(totalAmount).mul(10 ** 8);
        const amount = bnAmount.isNaN() ? null : bnAmount.toFixed(8);
        const approvePermissions =
            !this.state.interval || !amount
                ? null
                : {
                      origin: message.origin,
                      params: { interval, totalAmount: amount, type },
                  };
        const notifyPermissions = showNotify ? { canUse: showNotify, origin: message.origin } : null;
        const params = { notifyPermissions, approvePermissions };

        return (
            <div className={styles.transaction}>
                <div className={`${styles.originAuthTxScrollBox} transactionContent`} ref={this.getRef}>
                    <div className="margin-main margin-main-top headline3 basic500">
                        <Trans i18nKey="transactions.allowAccess">Allow access</Trans>
                    </div>

                    <div className="margin-main">
                        <OriginAuthCard {...this.props} />
                    </div>

                    <OriginAuthInfo message={message} assets={assets} />

                    <CollapsedContent className={styles.collapsed} titleElement={title} scrollElement={this.state.el}>
                        <ExtendedPermission
                            className={styles.collapsedContent}
                            originName={message.origin}
                            autoSign={null}
                            showNotify={false}
                            onChangePerms={(perms) => this.setState(perms)}
                        />
                    </CollapsedContent>
                </div>

                <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
                    <DropdownButton>
                        <Button id="reject" key={'reject'} onClick={this.props.reject} type={BUTTON_TYPE.WARNING}>
                            <Trans i18nKey="sign.reject">Reject</Trans>
                        </Button>
                        <Button
                            id="rejectForever"
                            key={'rejectForever'}
                            onClick={this.props.rejectForever}
                            type={BUTTON_TYPE.DANGER}
                            className={'custom'}
                        >
                            <Trans i18nKey="sign.blacklist">Add to blacklist</Trans>
                        </Button>
                    </DropdownButton>
                    <ApproveBtn id="approve" onClick={(e) => this.props.approve(e, params)} type={BUTTON_TYPE.SUBMIT}>
                        <Trans i18nKey="sign.auth">Auth</Trans>
                    </ApproveBtn>

                    <TransactionWallet account={this.props.selectedAccount} onSelect={this.props.selectAccount} />
                </div>
            </div>
        );
    }
}

const mapsToProps = (state) => ({
    origins: state.origins,
});

const actions = {};

export const OriginAuth = connect(mapsToProps, actions)(OriginAuthComponent);
