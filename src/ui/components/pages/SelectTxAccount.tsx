import * as styles from './styles/selectTxAccount.styl';
import * as React from 'react';
import { Trans, translate } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import {connect} from 'react-redux';
import { clearMessagesStatus, clearMessages } from '../../actions';
import { PAGES } from '../../pageConfig';
import { TransactionWallet } from '../wallets';

@translate('extension')
class SelectTxAccountComponent extends React.PureComponent {
    
    readonly props;
    onClick = () => {
        this.props.clearMessagesStatus();
        this.props.clearMessages();
        this.props.setTab(PAGES.ASSETS);
    };
    
    render() {
        return <div className={styles.content}>
            <TransactionWallet hideButton={true} account={this.props.selectAccount}>
                <div className={`${styles.arrowBackIcon} arrow-back-icon`} onClick={this.props.onBack}></div>
            </TransactionWallet>
            
            <div className="title1 margin-main-big">
                <Trans i18nKey='sign.changeAccount'>Do you want to change your account?</Trans>
            </div>

            <div className="margin-main-large body1">
                <Trans i18nKey='sign.changeAccountInfo'>If you change account, we will cancel the current transaction.
                    After selecting a new active account, repeat the operation.</Trans>
            </div>

            <Button type={BUTTON_TYPE.SUBMIT} onClick={this.onClick}>
                <Trans i18nKey='sign.switchAccount'>Switch account</Trans>
            </Button>
        </div>;
    }
}

const mapStateToProps = (state) => {
    return {
        selectAccount: state.selectedAccount,
    
}
};

export const SelectTxAccount = connect(mapStateToProps, { clearMessagesStatus, clearMessages })(SelectTxAccountComponent);
