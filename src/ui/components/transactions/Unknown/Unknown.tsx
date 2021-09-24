import * as styles from './unknown.styl';
import * as React from 'react';
import { Trans } from 'react-i18next';
import { SignClass } from '../SignClass';
import { UnknownCard } from './UnknownCard';
import { UnknownInfo } from './UnknownInfo';
import { TransactionWallet } from '../../wallets';
import { ApproveBtn, Button, BUTTON_TYPE } from '../../ui/buttons';

export class Unknown extends SignClass {
    render() {
        const { message, assets } = this.props;

        return (
            <div className={styles.transaction}>
                <div className={`${styles.unknownTxScrollBox} transactionContent`}>
                    <div className="margin-main margin-main-top headline3 basic500">
                        <Trans i18nKey="transactions.unknown">Unknown</Trans>
                    </div>

                    <div className="margin-main">
                        <UnknownCard {...this.props} />
                    </div>

                    <UnknownInfo message={message} assets={assets} />
                </div>

                <div className={`${styles.txButtonsWrapper} buttons-wrapper`}>
                    <Button onClick={this.props.reject} type={BUTTON_TYPE.WARNING}>
                        <Trans i18nKey="sign.reject">Reject</Trans>
                    </Button>
                    <ApproveBtn onClick={this.props.approve} type={BUTTON_TYPE.SUBMIT}>
                        <Trans i18nKey="sign.auth">Auth</Trans>
                    </ApproveBtn>

                    <TransactionWallet
                        account={this.props.selectedAccount}
                        hideApprove={true}
                        onSelect={this.props.selectAccount}
                    />
                </div>
            </div>
        );
    }
}
