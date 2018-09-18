import * as React from 'react';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import * as styles from './styles/accountInfo.styl';
import {Avatar} from '../ui/avatar/Avatar';

@translate('extension')
class AccountInfoComponent extends React.Component {

    readonly props;

    render() {

        const {selectedAccount} = this.props;
        const balance = this.props.balances[selectedAccount.address];

        return <div className={styles.content}>

            <div className={`flex margin-main-big ${styles.accountDetails}`}>
                <Avatar address={selectedAccount.address} size={48}/>
                <div>
                    <div>
                        <span className={`basic500 body1 ${styles.accountName}`}>{selectedAccount.name}</span>
                        <i className={styles.editIcon}></i>
                    </div>
                    <div className={`headline1 ${styles.balance}`}>{balance} Waves</div>
                </div>
            </div>

            <div className={`buttons-wrapper margin-main-big ${styles.buttonsWrapper}`}>
                <div className={`button disabled margin-main-big interface ${styles.activeAccount}`}>
                    <Trans i18nKey='ur.activeNow'>Active</Trans>
                </div>
                <div className={`button margin-main-big interface ${styles.showQrIcon}`}>
                    <Trans i18nKey='ui.showQR'>Show QR</Trans>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.address'>address</Trans>
                </div>
                <div className="input-like tag1">
                    9PCjZftzzhtY4ZLLBfsyvNxw8RwAgXZVZJX
                    <span className={`copy-icon ${styles.copyIcon}`}></span>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.pubKey'>pubKey</Trans>
                </div>
                <div className="input-like tag1">
                    4T25bBunzydwvzkJcQ9f378UzGRqyUcDXLS4xgam7JQX
                    <span className={`copy-icon ${styles.copyIcon}`}></span>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.privKey'>privKey</Trans>
                </div>
                <div className="input-like password-icon tag1">
                    9PCjZftzzhtY4ZLLBfsyvNxw8RwAgXZVZJX
                    <span className={`copy-icon ${styles.copyIcon}`}></span>
                </div>
            </div>

            <div className="margin-main-big">
                <div className="input-title basic500 tag1">
                    <Trans i18nKey='accountInfo.backUp'>backUp</Trans>
                </div>
                <div className="input-like password-icon tag1">
                    9PCjZftzzhtY4ZLLBfsyvNxw8RwAgXZVZJX
                    <span className={`copy-icon ${styles.copyIcon}`}></span>
                </div>
            </div>

        </div>

    }
}

const mapStateToProps = function (store: any) {
    return {
        selectedAccount: store.selectedAccount,
        balances: store.balances,
    };
};

export const AccountInfo = connect(mapStateToProps)(AccountInfoComponent);
