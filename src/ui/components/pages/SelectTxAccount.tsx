import * as styles from './styles/selectTxAccount.styl';
import * as React from 'react';
import { Trans, translate } from 'react-i18next';
import { Button, BUTTON_TYPE } from '../ui/buttons';
import {connect} from 'react-redux';
import { clearMessagesStatus, clearMessages, updateActiveMessage, reject } from '../../actions';
import { PAGES } from '../../pageConfig';
import { TransactionWallet } from '../wallets';
import { I18N_NAME_SPACE } from '../../appConfig';
import { Intro } from './Intro';

@translate(I18N_NAME_SPACE)
class SelectTxAccountComponent extends React.PureComponent {
    
    readonly state = { loading: false };
    readonly props;
    
    onClick = () => {
        this.props.messages.forEach(({ id }) => this.props.reject(id));
        this.props.clearMessages();
        this.props.clearMessagesStatus();
        this.props.updateActiveMessage();
        this.setState({ loading: true });
    };
    
    render() {
        
        if (this.state.loading) {
            return <Intro/>;
        }
        
        return <div className={styles.content}>
            <TransactionWallet className={styles.userWallet} hideButton={true} account={this.props.selectAccount}>
                <div className={styles.closeIcon} onClick={this.props.onBack}></div>
            </TransactionWallet>
            <div className={styles.wrapper}>
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
            </div>
        </div>;
    }
    
    static getDerivedStateFromProps(props, state) {
        const { activeMessage, messages } = props;
        
        if (!activeMessage && messages.length === 0) {
            props.setTab(PAGES.ASSETS);
            return { loading: false };
        }
        
        return state;
    }
}

const mapStateToProps = (state) => {
    return {
        selectAccount: state.selectedAccount,
        messages: state.messages,
        activeMessage: state.activeMessage,
    };
};

const actions = {
    updateActiveMessage,
    clearMessagesStatus,
    clearMessages,
    reject
};

export const SelectTxAccount = connect(mapStateToProps, actions)(SelectTxAccountComponent);
