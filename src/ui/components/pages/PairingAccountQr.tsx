import * as React from 'react';
import {connect} from 'react-redux';
import {Trans, translate} from 'react-i18next';
import * as styles from './styles/pairingAccountQr.styl';
import { QRCode, Button } from '../ui';
import { I18N_NAME_SPACE } from '../../appConfig';
import { TransactionWallet } from '../wallets';
import { PAGES } from '../../pageConfig';
import { Intro } from './Intro';


@translate(I18N_NAME_SPACE)
class PairingAccountQrComponent extends React.PureComponent {

    readonly props;
    qrCode: QRCode;
    
    getQrRef = (qr) => this.qrCode = qr;
    selectAccountHandler = () => this.selectAccount();
    
    selectAccount() {
        this.props.setTab(PAGES.CHANGE_TX_ACCOUNT);
    }
    
    render() {
        const address = this.props.selectedAccount.address;

        return <div className={`center ${styles.content}`}>
            <div>
                <TransactionWallet account={this.props.selectedAccount} onSelect={this.selectAccountHandler}/>
            </div>
            
            <div className={styles.qrCode}>
                <QRCode ref={this.getQrRef}
                        width={200}
                        height={200}
                        scale={16}
                        quality={1}
                        margin={1}
                        type='image/png'
                        text={address}/>
            </div>
            
            <div>
                <Trans i18nKey="pairing.scanInfo">
                    Scan the code below with your iPhone or Android device to pair it with your account.
                </Trans>
    
                <Trans i18nKey="pairing.appInfo">
                    Download our mobile applications below:
                </Trans>
            </div>
            
            <div>
                <a href="#" target="_blank">Google Play</a>
                <a href="#" target="_blank">Apple Store</a>
            </div>
        </div>;
    }
}

const mapStateToProps = function (store: any) {
    const activeAccount = store.selectedAccount.address;
    const selected =  store.localState.assets.account ?  store.localState.assets.account.address : activeAccount;
    const selectedAccount = store.accounts.find(({ address }) => address === selected);
    return {
        selectedAccount,
    };
};

export const PairingAccountQr = connect(mapStateToProps)(PairingAccountQrComponent);
